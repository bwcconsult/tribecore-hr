import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Like } from 'typeorm';
import { ExpenseClaim } from '../entities/expense-claim.entity';
import { ExpenseItem } from '../entities/expense-item.entity';
import { CreateExpenseClaimDto } from '../dto/create-expense-claim.dto';
import { UpdateExpenseClaimDto } from '../dto/update-expense-claim.dto';
import { ExpenseQueryDto } from '../dto/expense-query.dto';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { AuditTrailService } from './audit-trail.service';
import { PolicyService } from './policy.service';

@Injectable()
export class ExpenseClaimService {
  constructor(
    @InjectRepository(ExpenseClaim)
    private claimRepository: Repository<ExpenseClaim>,
    @InjectRepository(ExpenseItem)
    private itemRepository: Repository<ExpenseItem>,
    private auditTrailService: AuditTrailService,
    private policyService: PolicyService,
  ) {}

  async create(employeeId: string, createDto: CreateExpenseClaimDto, userId: string): Promise<ExpenseClaim> {
    // Calculate total amount from items
    const totalAmount = createDto.items.reduce((sum, item) => sum + item.amount, 0);

    const claim = this.claimRepository.create({
      employeeId,
      title: createDto.title,
      description: createDto.description,
      totalAmount,
      currency: createDto.currency || 'GBP',
      exchangeRate: createDto.exchangeRate || 1,
      departmentId: createDto.departmentId,
      projectId: createDto.projectId,
      notes: createDto.notes,
      status: ExpenseStatus.DRAFT,
    });

    const savedClaim = await this.claimRepository.save(claim);

    // Create expense items
    const items = createDto.items.map(itemDto => {
      return this.itemRepository.create({
        claimId: savedClaim.id,
        ...itemDto,
        currency: itemDto.currency || createDto.currency || 'GBP',
      });
    });

    await this.itemRepository.save(items);

    // Audit trail
    await this.auditTrailService.log({
      claimId: savedClaim.id,
      userId,
      action: 'CREATED',
      entity: 'ExpenseClaim',
      entityId: savedClaim.id,
      newValues: savedClaim,
    });

    return this.findOne(savedClaim.id);
  }

  async findAll(query: ExpenseQueryDto): Promise<{ data: ExpenseClaim[]; total: number; page: number; limit: number }> {
    const {
      status,
      employeeId,
      departmentId,
      projectId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.claimRepository
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.employee', 'employee')
      .leftJoinAndSelect('claim.items', 'items')
      .leftJoinAndSelect('items.category', 'category')
      .leftJoinAndSelect('claim.approvals', 'approvals');

    // Filters
    if (status) {
      queryBuilder.andWhere('claim.status = :status', { status });
    }

    if (employeeId) {
      queryBuilder.andWhere('claim.employeeId = :employeeId', { employeeId });
    }

    if (departmentId) {
      queryBuilder.andWhere('claim.departmentId = :departmentId', { departmentId });
    }

    if (projectId) {
      queryBuilder.andWhere('claim.projectId = :projectId', { projectId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('claim.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('claim.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('claim.createdAt <= :endDate', { endDate });
    }

    if (minAmount) {
      queryBuilder.andWhere('claim.totalAmount >= :minAmount', { minAmount });
    }

    if (maxAmount) {
      queryBuilder.andWhere('claim.totalAmount <= :maxAmount', { maxAmount });
    }

    if (search) {
      queryBuilder.andWhere(
        '(claim.title LIKE :search OR claim.description LIKE :search OR claim.claimNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    queryBuilder.orderBy(`claim.${sortBy}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ExpenseClaim> {
    const claim = await this.claimRepository.findOne({
      where: { id },
      relations: ['employee', 'items', 'items.category', 'items.receipts', 'approvals', 'approvals.approver', 'reimbursements'],
    });

    if (!claim) {
      throw new NotFoundException(`Expense claim with ID ${id} not found`);
    }

    return claim;
  }

  async update(id: string, updateDto: UpdateExpenseClaimDto, userId: string): Promise<ExpenseClaim> {
    const claim = await this.findOne(id);

    // Only allow updates on DRAFT claims
    if (claim.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestException('Only draft claims can be edited');
    }

    const oldValues = { ...claim };

    // Update basic fields
    Object.assign(claim, {
      title: updateDto.title ?? claim.title,
      description: updateDto.description ?? claim.description,
      currency: updateDto.currency ?? claim.currency,
      exchangeRate: updateDto.exchangeRate ?? claim.exchangeRate,
      departmentId: updateDto.departmentId ?? claim.departmentId,
      projectId: updateDto.projectId ?? claim.projectId,
      notes: updateDto.notes ?? claim.notes,
    });

    // If items are provided, update them
    if (updateDto.items) {
      // Delete existing items
      await this.itemRepository.delete({ claimId: id });

      // Create new items
      const items = updateDto.items.map(itemDto => {
        return this.itemRepository.create({
          claimId: id,
          ...itemDto,
          currency: itemDto.currency || updateDto.currency || claim.currency,
        });
      });

      await this.itemRepository.save(items);

      // Recalculate total
      claim.totalAmount = updateDto.items.reduce((sum, item) => sum + item.amount, 0);
    }

    const updatedClaim = await this.claimRepository.save(claim);

    // Audit trail
    await this.auditTrailService.log({
      claimId: id,
      userId,
      action: 'UPDATED',
      entity: 'ExpenseClaim',
      entityId: id,
      oldValues,
      newValues: updatedClaim,
    });

    return this.findOne(id);
  }

  async submit(id: string, userId: string): Promise<ExpenseClaim> {
    const claim = await this.findOne(id);

    if (claim.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestException('Only draft claims can be submitted');
    }

    // Validate policy rules
    const violations = await this.policyService.validateClaim(claim);

    claim.status = ExpenseStatus.SUBMITTED;
    claim.submittedAt = new Date();
    claim.hasPolicyViolations = violations.length > 0;
    claim.policyViolations = violations;

    const updatedClaim = await this.claimRepository.save(claim);

    // Audit trail
    await this.auditTrailService.log({
      claimId: id,
      userId,
      action: 'SUBMITTED',
      entity: 'ExpenseClaim',
      entityId: id,
      newValues: { status: ExpenseStatus.SUBMITTED },
    });

    // TODO: Trigger approval workflow

    return updatedClaim;
  }

  async delete(id: string, userId: string): Promise<void> {
    const claim = await this.findOne(id);

    // Only allow deletion of DRAFT or REJECTED claims
    if (![ExpenseStatus.DRAFT, ExpenseStatus.REJECTED].includes(claim.status)) {
      throw new BadRequestException('Only draft or rejected claims can be deleted');
    }

    await this.auditTrailService.log({
      claimId: id,
      userId,
      action: 'DELETED',
      entity: 'ExpenseClaim',
      entityId: id,
      oldValues: claim,
    });

    await this.claimRepository.remove(claim);
  }

  async getMyExpenses(employeeId: string, query: ExpenseQueryDto): Promise<{ data: ExpenseClaim[]; total: number }> {
    const result = await this.findAll({
      ...query,
      employeeId,
    });

    return result;
  }

  async getStatistics(employeeId?: string): Promise<any> {
    const queryBuilder = this.claimRepository.createQueryBuilder('claim');

    if (employeeId) {
      queryBuilder.where('claim.employeeId = :employeeId', { employeeId });
    }

    const [
      totalClaims,
      draftCount,
      submittedCount,
      approvedCount,
      rejectedCount,
      paidCount,
      totalAmount,
      approvedAmount,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().where('claim.status = :status', { status: ExpenseStatus.DRAFT }).getCount(),
      queryBuilder.clone().where('claim.status = :status', { status: ExpenseStatus.SUBMITTED }).getCount(),
      queryBuilder.clone().where('claim.status = :status', { status: ExpenseStatus.APPROVED }).getCount(),
      queryBuilder.clone().where('claim.status = :status', { status: ExpenseStatus.REJECTED }).getCount(),
      queryBuilder.clone().where('claim.status = :status', { status: ExpenseStatus.PAID }).getCount(),
      queryBuilder.clone().select('SUM(claim.totalAmount)', 'total').getRawOne(),
      queryBuilder
        .clone()
        .where('claim.status IN (:...statuses)', { statuses: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] })
        .select('SUM(claim.totalAmount)', 'total')
        .getRawOne(),
    ]);

    return {
      totalClaims,
      byStatus: {
        draft: draftCount,
        submitted: submittedCount,
        approved: approvedCount,
        rejected: rejectedCount,
        paid: paidCount,
      },
      amounts: {
        total: parseFloat(totalAmount?.total || '0'),
        approved: parseFloat(approvedAmount?.total || '0'),
      },
    };
  }
}
