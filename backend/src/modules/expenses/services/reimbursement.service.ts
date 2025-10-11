import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reimbursement } from '../entities/reimbursement.entity';
import { ExpenseClaim } from '../entities/expense-claim.entity';
import { CreateReimbursementDto } from '../dto/create-reimbursement.dto';
import { ReimbursementStatus } from '../enums/payment-method.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { AuditTrailService } from './audit-trail.service';
import { EmailService } from '../../notifications/services/email.service';

@Injectable()
export class ReimbursementService {
  constructor(
    @InjectRepository(Reimbursement)
    private reimbursementRepository: Repository<Reimbursement>,
    @InjectRepository(ExpenseClaim)
    private claimRepository: Repository<ExpenseClaim>,
    private auditTrailService: AuditTrailService,
    private emailService: EmailService,
  ) {}

  async create(claimId: string, createDto: CreateReimbursementDto, processedBy: string): Promise<Reimbursement> {
    const claim = await this.claimRepository.findOneOrFail({ where: { id: claimId } });

    // Only approved claims can be reimbursed
    if (claim.status !== ExpenseStatus.APPROVED) {
      throw new BadRequestException('Only approved claims can be reimbursed');
    }

    const reimbursement = this.reimbursementRepository.create({
      claimId,
      ...createDto,
      processedBy,
      status: ReimbursementStatus.PENDING,
    });

    const saved = await this.reimbursementRepository.save(reimbursement);

    await this.auditTrailService.log({
      claimId,
      userId: processedBy,
      action: 'REIMBURSEMENT_CREATED',
      entity: 'Reimbursement',
      entityId: saved.id,
      newValues: saved,
    });

    return saved;
  }

  async findAll(status?: ReimbursementStatus): Promise<Reimbursement[]> {
    const query: any = {};
    if (status) {
      query.status = status;
    }

    return this.reimbursementRepository.find({
      where: query,
      relations: ['claim', 'claim.employee', 'processor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Reimbursement> {
    const reimbursement = await this.reimbursementRepository.findOne({
      where: { id },
      relations: ['claim', 'claim.employee', 'processor'],
    });

    if (!reimbursement) {
      throw new NotFoundException(`Reimbursement with ID ${id} not found`);
    }

    return reimbursement;
  }

  async markAsPaid(id: string, userId: string, paymentReference?: string): Promise<Reimbursement> {
    const reimbursement = await this.findOne(id);

    reimbursement.status = ReimbursementStatus.PAID;
    reimbursement.paidAt = new Date();
    reimbursement.paymentReference = paymentReference || reimbursement.paymentReference;

    const updated = await this.reimbursementRepository.save(reimbursement);

    // Update claim status
    await this.claimRepository.update(reimbursement.claimId, {
      status: ExpenseStatus.PAID,
      paidAt: new Date(),
    });

    await this.auditTrailService.log({
      claimId: reimbursement.claimId,
      userId,
      action: 'REIMBURSEMENT_PAID',
      entity: 'Reimbursement',
      entityId: id,
      newValues: { status: ReimbursementStatus.PAID },
    });

    // Send reimbursement processed email
    try {
      const employee = reimbursement.claim.employee;
      await this.emailService.sendReimbursementProcessedEmail(
        `${employee.firstName} ${employee.lastName}`,
        employee.email,
        reimbursement.claim.claimNumber,
        reimbursement.amount,
        reimbursement.currency,
        reimbursement.paymentMethod,
      );
    } catch (error) {
      console.error('Failed to send reimbursement email:', error);
    }

    return updated;
  }

  async markAsFailed(id: string, userId: string, errorMessage: string): Promise<Reimbursement> {
    const reimbursement = await this.findOne(id);

    reimbursement.status = ReimbursementStatus.FAILED;
    reimbursement.errorMessage = errorMessage;
    reimbursement.retryCount += 1;

    const updated = await this.reimbursementRepository.save(reimbursement);

    await this.auditTrailService.log({
      claimId: reimbursement.claimId,
      userId,
      action: 'REIMBURSEMENT_FAILED',
      entity: 'Reimbursement',
      entityId: id,
      newValues: { status: ReimbursementStatus.FAILED, errorMessage },
    });

    return updated;
  }

  async processBatch(batchNumber: string, userId: string): Promise<Reimbursement[]> {
    const reimbursements = await this.reimbursementRepository.find({
      where: { batchNumber, status: ReimbursementStatus.PENDING },
    });

    for (const reimbursement of reimbursements) {
      reimbursement.status = ReimbursementStatus.PROCESSING;
      await this.reimbursementRepository.save(reimbursement);
    }

    await this.auditTrailService.log({
      userId,
      action: 'BATCH_PROCESSING',
      entity: 'Reimbursement',
      entityId: batchNumber,
      notes: `Processing batch ${batchNumber} with ${reimbursements.length} reimbursements`,
    });

    return reimbursements;
  }

  async getPendingTotal(): Promise<number> {
    const result = await this.reimbursementRepository
      .createQueryBuilder('reimbursement')
      .select('SUM(reimbursement.amount)', 'total')
      .where('reimbursement.status = :status', { status: ReimbursementStatus.PENDING })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  async getStatistics(): Promise<any> {
    const [pending, processing, paid, failed, totalPending] = await Promise.all([
      this.reimbursementRepository.count({ where: { status: ReimbursementStatus.PENDING } }),
      this.reimbursementRepository.count({ where: { status: ReimbursementStatus.PROCESSING } }),
      this.reimbursementRepository.count({ where: { status: ReimbursementStatus.PAID } }),
      this.reimbursementRepository.count({ where: { status: ReimbursementStatus.FAILED } }),
      this.getPendingTotal(),
    ]);

    return {
      counts: {
        pending,
        processing,
        paid,
        failed,
      },
      pendingAmount: totalPending,
    };
  }
}
