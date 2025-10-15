import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from '../entities/contract.entity';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { ContractAuditLog, ContractAuditAction } from '../entities/contract-audit-log.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(ContractAuditLog)
    private auditLogRepository: Repository<ContractAuditLog>,
  ) {}

  /**
   * Create a new contract
   */
  async create(
    organizationId: string,
    createDto: CreateContractDto,
    createdBy: string,
  ): Promise<Contract> {
    // Generate contract number
    const contractNumber = await this.generateContractNumber(organizationId);

    const contract = this.contractRepository.create({
      ...createDto,
      organizationId,
      contractNumber,
      createdBy,
      status: ContractStatus.DRAFT,
      version: 1,
    });

    const saved = await this.contractRepository.save(contract);

    // Audit log
    await this.createAuditLog(
      saved.id,
      createdBy,
      'System',
      ContractAuditAction.CREATED,
      'CONTRACT',
      saved.id,
      null,
      { title: saved.title, type: saved.type },
    );

    return saved;
  }

  /**
   * Find all contracts for organization
   */
  async findAll(
    organizationId: string,
    filters?: {
      type?: string;
      status?: string;
      ownerId?: string;
      counterpartyId?: string;
    },
  ): Promise<Contract[]> {
    const query = this.contractRepository
      .createQueryBuilder('contract')
      .where('contract.organizationId = :organizationId', { organizationId });

    if (filters?.type) {
      query.andWhere('contract.type = :type', { type: filters.type });
    }
    if (filters?.status) {
      query.andWhere('contract.status = :status', { status: filters.status });
    }
    if (filters?.ownerId) {
      query.andWhere('contract.ownerId = :ownerId', { ownerId: filters.ownerId });
    }
    if (filters?.counterpartyId) {
      query.andWhere('contract.counterpartyId = :counterpartyId', {
        counterpartyId: filters.counterpartyId,
      });
    }

    return await query
      .leftJoinAndSelect('contract.owner', 'owner')
      .orderBy('contract.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Find contract by ID
   */
  async findOne(id: string, organizationId: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id, organizationId },
      relations: ['owner', 'clauses', 'approvals', 'obligations', 'renewals'],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  /**
   * Update contract
   */
  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateContractDto,
    updatedBy: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, organizationId);

    // Can't update if not in DRAFT or INTERNAL_REVIEW
    if (
      contract.status !== ContractStatus.DRAFT &&
      contract.status !== ContractStatus.INTERNAL_REVIEW
    ) {
      throw new BadRequestException('Contract cannot be updated in current status');
    }

    const before = { ...contract };
    Object.assign(contract, updateDto);

    const updated = await this.contractRepository.save(contract);

    // Audit log
    await this.createAuditLog(
      contract.id,
      updatedBy,
      'System',
      ContractAuditAction.UPDATED,
      'CONTRACT',
      contract.id,
      before,
      updateDto,
    );

    return updated;
  }

  /**
   * Submit contract for internal review
   */
  async submitForReview(
    id: string,
    organizationId: string,
    submittedBy: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, organizationId);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Contract must be in DRAFT status');
    }

    contract.status = ContractStatus.INTERNAL_REVIEW;
    contract.submittedBy = submittedBy;
    contract.submittedAt = new Date();

    const updated = await this.contractRepository.save(contract);

    // Audit log
    await this.createAuditLog(
      contract.id,
      submittedBy,
      'System',
      ContractAuditAction.SUBMITTED,
      'CONTRACT',
      contract.id,
      { status: ContractStatus.DRAFT },
      { status: ContractStatus.INTERNAL_REVIEW },
    );

    return updated;
  }

  /**
   * Send for counterparty review
   */
  async sendForCounterpartyReview(
    id: string,
    organizationId: string,
    sentBy: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, organizationId);

    // Must be INTERNAL_REVIEW and all approvals completed
    if (contract.status !== ContractStatus.INTERNAL_REVIEW) {
      throw new BadRequestException('Contract must complete internal review first');
    }

    contract.status = ContractStatus.COUNTERPARTY_REVIEW;

    const updated = await this.contractRepository.save(contract);

    // Audit log
    await this.createAuditLog(
      contract.id,
      sentBy,
      'System',
      ContractAuditAction.SENT_FOR_NEGOTIATION,
      'CONTRACT',
      contract.id,
      null,
      null,
    );

    return updated;
  }

  /**
   * Mark contract as agreed (final)
   */
  async markAsAgreed(
    id: string,
    organizationId: string,
    agreedBy: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, organizationId);

    if (
      contract.status !== ContractStatus.COUNTERPARTY_REVIEW &&
      contract.status !== ContractStatus.INTERNAL_REVIEW
    ) {
      throw new BadRequestException('Contract must be in review status');
    }

    contract.status = ContractStatus.AGREED;

    const updated = await this.contractRepository.save(contract);

    // Audit log
    await this.createAuditLog(
      contract.id,
      agreedBy,
      'System',
      ContractAuditAction.APPROVED,
      'CONTRACT',
      contract.id,
      null,
      null,
    );

    return updated;
  }

  /**
   * Launch e-signature
   */
  async launchSignature(
    id: string,
    organizationId: string,
    launchedBy: string,
    signatureProvider: string,
    envelopeId: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, organizationId);

    if (contract.status !== ContractStatus.AGREED) {
      throw new BadRequestException('Contract must be agreed before signing');
    }

    contract.status = ContractStatus.E_SIGNATURE;
    contract.signatureProvider = signatureProvider;
    contract.envelopeId = envelopeId;

    const updated = await this.contractRepository.save(contract);

    return updated;
  }

  /**
   * Mark contract as executed (all parties signed)
   */
  async markAsExecuted(
    id: string,
    organizationId: string,
    executedBy: string,
    documentHash: string,
    signedCertificateUrl: string,
    repositoryUrl: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, organizationId);

    if (contract.status !== ContractStatus.E_SIGNATURE) {
      throw new BadRequestException('Contract must be in e-signature status');
    }

    contract.status = ContractStatus.EXECUTED;
    contract.executedBy = executedBy;
    contract.executedAt = new Date();
    contract.signedAt = new Date();
    contract.documentHash = documentHash;
    contract.signedCertificateUrl = signedCertificateUrl;
    contract.repositoryUrl = repositoryUrl;

    const updated = await this.contractRepository.save(contract);

    // Audit log
    await this.createAuditLog(
      contract.id,
      executedBy,
      'System',
      ContractAuditAction.EXECUTED,
      'CONTRACT',
      contract.id,
      null,
      null,
    );

    return updated;
  }

  /**
   * Activate contract (start obligation tracking)
   */
  async activate(
    id: string,
    organizationId: string,
    activatedBy: string,
  ): Promise<Contract> {
    const contract = await this.findOne(id, organizationId);

    if (contract.status !== ContractStatus.EXECUTED) {
      throw new BadRequestException('Contract must be executed first');
    }

    contract.status = ContractStatus.ACTIVE;

    const updated = await this.contractRepository.save(contract);

    // Audit log
    await this.createAuditLog(
      contract.id,
      activatedBy,
      'System',
      ContractAuditAction.ACTIVATED,
      'CONTRACT',
      contract.id,
      null,
      null,
    );

    return updated;
  }

  /**
   * Delete contract (only if DRAFT)
   */
  async delete(id: string, organizationId: string): Promise<void> {
    const contract = await this.findOne(id, organizationId);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only draft contracts can be deleted');
    }

    await this.contractRepository.remove(contract);
  }

  /**
   * Get contract statistics
   */
  async getStats(organizationId: string) {
    const contracts = await this.findAll(organizationId);

    return {
      total: contracts.length,
      byStatus: {
        draft: contracts.filter((c) => c.status === ContractStatus.DRAFT).length,
        inReview: contracts.filter((c) =>
          [ContractStatus.INTERNAL_REVIEW, ContractStatus.COUNTERPARTY_REVIEW].includes(c.status),
        ).length,
        awaitingSignature: contracts.filter((c) => c.status === ContractStatus.E_SIGNATURE).length,
        active: contracts.filter((c) => c.status === ContractStatus.ACTIVE).length,
        expired: contracts.filter((c) =>
          [ContractStatus.TERMINATED, ContractStatus.ARCHIVED].includes(c.status),
        ).length,
      },
      byType: contracts.reduce((acc, contract) => {
        acc[contract.type] = (acc[contract.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalValue: contracts
        .filter((c) => c.value && c.status === ContractStatus.ACTIVE)
        .reduce((sum, c) => sum + Number(c.value), 0),
      expiringSoon: contracts.filter((c) => {
        if (!c.endDate || c.status !== ContractStatus.ACTIVE) return false;
        const daysUntilExpiry = Math.ceil(
          (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
      }).length,
    };
  }

  /**
   * Generate unique contract number
   */
  private async generateContractNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CON-${year}`;

    const lastContract = await this.contractRepository
      .createQueryBuilder('contract')
      .where('contract.organizationId = :organizationId', { organizationId })
      .andWhere('contract.contractNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('contract.contractNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastContract) {
      const lastNumber = lastContract.contractNumber.split('-').pop();
      sequence = parseInt(lastNumber || '0', 10) + 1;
    }

    return `${prefix}-${sequence.toString().padStart(5, '0')}`;
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(
    contractId: string,
    actorId: string,
    actorName: string,
    action: ContractAuditAction,
    targetType: string,
    targetId: string,
    before: any,
    after: any,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      contractId,
      actorId,
      actorName,
      action,
      targetType,
      targetId,
      before,
      after,
    });

    await this.auditLogRepository.save(auditLog);
  }
}
