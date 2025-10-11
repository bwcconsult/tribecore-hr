import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create(createExpenseDto);
    return await this.expenseRepository.save(expense);
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: Expense[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.employee', 'employee')
      .where('expense.organizationId = :organizationId', { organizationId });

    if (search) {
      query.andWhere(
        '(expense.merchant ILIKE :search OR expense.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('expense.expenseDate', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByEmployee(
    employeeId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: Expense[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.expenseRepository.findAndCount({
      where: { employeeId },
      order: { expenseDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    Object.assign(expense, updateExpenseDto);
    return await this.expenseRepository.save(expense);
  }

  async approve(id: string, approvedBy: string): Promise<Expense> {
    const expense = await this.findOne(id);
    expense.status = 'APPROVED' as any;
    expense.approvedBy = approvedBy;
    expense.approvedAt = new Date();
    return await this.expenseRepository.save(expense);
  }

  async reject(id: string, approvedBy: string, reason: string): Promise<Expense> {
    const expense = await this.findOne(id);
    expense.status = 'REJECTED' as any;
    expense.approvedBy = approvedBy;
    expense.approvedAt = new Date();
    expense.rejectionReason = reason;
    return await this.expenseRepository.save(expense);
  }

  async markAsPaid(id: string, paymentReference: string): Promise<Expense> {
    const expense = await this.findOne(id);
    expense.status = 'PAID' as any;
    expense.paidDate = new Date();
    expense.paymentReference = paymentReference;
    return await this.expenseRepository.save(expense);
  }

  async delete(id: string): Promise<void> {
    const expense = await this.findOne(id);
    await this.expenseRepository.remove(expense);
  }

  async getStats(organizationId: string) {
    const [total, pending, approved, rejected, totalAmount] = await Promise.all([
      this.expenseRepository.count({ where: { organizationId } }),
      this.expenseRepository.count({ where: { organizationId, status: 'SUBMITTED' } }),
      this.expenseRepository.count({ where: { organizationId, status: 'APPROVED' } }),
      this.expenseRepository.count({ where: { organizationId, status: 'REJECTED' } }),
      this.expenseRepository
        .createQueryBuilder('expense')
        .select('SUM(expense.amount)', 'total')
        .where('expense.organizationId = :organizationId', { organizationId })
        .andWhere('expense.status = :status', { status: 'APPROVED' })
        .getRawOne(),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      totalAmount: parseFloat(totalAmount?.total || '0'),
    };
  }
}
