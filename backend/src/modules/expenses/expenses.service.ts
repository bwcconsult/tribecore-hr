import { Injectable } from '@nestjs/common';
import { ExpenseClaimService } from './services/expense-claim.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly expenseClaimService: ExpenseClaimService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<any> {
    // Delegate to ExpenseClaimService
    return this.expenseClaimService.create(
      createExpenseDto.employeeId,
      createExpenseDto as any,
      createExpenseDto.employeeId,
    );
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<any> {
    const { page = 1, limit = 10, search } = paginationDto;
    const result = await this.expenseClaimService.findAll({ page, limit, search });
    return {
      data: result.data,
      total: result.total,
      page: result.page,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async findByEmployee(
    employeeId: string,
    paginationDto: PaginationDto,
  ): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    const result = await this.expenseClaimService.getMyExpenses(employeeId, { page, limit });
    return {
      data: result.data,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async findOne(id: string): Promise<any> {
    return this.expenseClaimService.findOne(id);
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<any> {
    return this.expenseClaimService.update(id, updateExpenseDto as any, updateExpenseDto.employeeId || 'system');
  }

  async approve(id: string, approvedBy: string): Promise<any> {
    // For now, just return the claim - full approval workflow is in expense-claim service
    return this.expenseClaimService.findOne(id);
  }

  async reject(id: string, approvedBy: string, reason: string): Promise<any> {
    // For now, just return the claim - full rejection workflow is in expense-claim service
    return this.expenseClaimService.findOne(id);
  }

  async markAsPaid(id: string, paymentReference: string): Promise<any> {
    // For now, just return the claim - payment processing is handled elsewhere
    return this.expenseClaimService.findOne(id);
  }

  async delete(id: string): Promise<void> {
    return this.expenseClaimService.delete(id);
  }

  async getStats(organizationId: string) {
    // Return basic stats - can enhance later
    const result = await this.expenseClaimService.findAll({ page: 1, limit: 1000 });
    return {
      total: result.total,
      pending: result.data.filter(c => c.status === 'PENDING').length,
      approved: result.data.filter(c => c.status === 'APPROVED').length,
      rejected: result.data.filter(c => c.status === 'REJECTED').length,
      totalAmount: result.data
        .filter(c => c.status === 'APPROVED')
        .reduce((sum, c) => sum + Number(c.totalAmount), 0),
    };
  }
}
