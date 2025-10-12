import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseStatus } from '../entities/expense.entity';
import { ExpenseClaim, ClaimStatus } from '../entities/expense-claim.entity';
import { ExpenseItem } from '../entities/expense-item.entity';
import { ExpenseCategory } from '../entities/expense-category.entity';
import { TaxCode } from '../entities/tax-code.entity';
import { Approval, ApprovalDecision } from '../entities/approval.entity';
import { User } from '../../users/entities/user.entity';

@ApiTags('Expenses API')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api')
export class ExpensesApiController {
  constructor(
    @InjectRepository(Expense)
    private expenseRepo: Repository<Expense>,
    @InjectRepository(ExpenseClaim)
    private claimRepo: Repository<ExpenseClaim>,
    @InjectRepository(ExpenseItem)
    private itemRepo: Repository<ExpenseItem>,
    @InjectRepository(ExpenseCategory)
    private categoryRepo: Repository<ExpenseCategory>,
    @InjectRepository(TaxCode)
    private taxCodeRepo: Repository<TaxCode>,
    @InjectRepository(Approval)
    private approvalRepo: Repository<Approval>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Categories & Tax
  @Get('expense-categories')
  @ApiOperation({ summary: 'Get all expense categories' })
  async getCategories() {
    return this.categoryRepo.find({
      where: { active: true },
      relations: ['taxCode'],
      order: { name: 'ASC' },
    });
  }

  @Get('tax-codes')
  @ApiOperation({ summary: 'Get all tax codes' })
  async getTaxCodes() {
    return this.taxCodeRepo.find({
      where: { active: true },
      order: { region: 'ASC', rate: 'ASC' },
    });
  }

  // Claims
  @Get('expenses/my-expenses')
  @ApiOperation({ summary: 'Get my expenses with filters' })
  async getMyExpenses(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('q') q?: string,
  ) {
    const query = this.claimRepo.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.createdBy', 'createdBy')
      .leftJoinAndSelect('claim.items', 'items')
      .leftJoinAndSelect('claim.approvals', 'approvals')
      .leftJoinAndSelect('claim.project', 'project')
      .where('claim.createdById = :userId', { userId: req.user.id });

    if (status) {
      query.andWhere('claim.status = :status', { status: status.toUpperCase() });
    }

    if (q) {
      query.andWhere(
        '(claim.title ILIKE :q OR claim.description ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit).orderBy('claim.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Get all expenses with filters and pagination' })
  async getExpenses(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('q') q?: string,
  ) {
    const query = this.expenseRepo.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.employee', 'employee');

    if (status) {
      query.andWhere('expense.status = :status', { status: status.toUpperCase() });
    }

    if (q) {
      query.andWhere(
        '(expense.description ILIKE :q OR expense.merchant ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit).orderBy('expense.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('expenses/:id')
  @ApiOperation({ summary: 'Get expense claim detail' })
  async getExpenseDetail(@Param('id') id: string) {
    const claim = await this.claimRepo.findOne({
      where: { id },
      relations: [
        'createdBy',
        'approver',
        'items',
        'items.category',
        'items.taxCode',
        'items.currency',
        'approvals',
        'approvals.approver',
        'project',
        'currency',
      ],
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    return claim;
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Create new expense claim' })
  async createExpense(@Request() req, @Body() body: any) {
    const { title, description, currencyCode = 'GBP', items = [] } = body;

    let totalAmount = 0;
    const claim = this.claimRepo.create({
      title,
      description,
      currencyCode,
      createdById: req.user.id,
      totalAmount: 0,
      status: ClaimStatus.DRAFT,
    });

    const savedClaim = await this.claimRepo.save(claim);

    // Create items
    for (const item of items) {
      const expenseItem = this.itemRepo.create({
        claimId: savedClaim.id,
        categoryId: item.categoryId,
        txnDate: new Date(item.txnDate),
        amount: item.amount,
        currencyCode: item.currencyCode || currencyCode,
        merchant: item.merchant,
        description: item.description,
        taxCodeId: item.taxCodeId,
        receiptUrl: item.receiptUrl,
        distanceKm: item.distanceKm,
      });

      await this.itemRepo.save(expenseItem);
      totalAmount += item.amount;
    }

    // Update total
    savedClaim.totalAmount = totalAmount;
    await this.claimRepo.save(savedClaim);

    return this.getExpenseDetail(savedClaim.id);
  }

  @Put('expenses/:id')
  @ApiOperation({ summary: 'Update expense claim (DRAFT/RETURNED only)' })
  async updateExpense(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const claim = await this.claimRepo.findOne({ where: { id } });
    
    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.status !== ClaimStatus.DRAFT && claim.status !== ClaimStatus.REJECTED) {
      throw new Error('Only DRAFT or RETURNED claims can be edited');
    }

    const { title, description, currencyCode, items = [] } = body;

    claim.title = title || claim.title;
    claim.description = description ?? claim.description;
    claim.currencyCode = currencyCode || claim.currencyCode;

    // If items provided, replace all items
    if (items.length > 0) {
      await this.itemRepo.delete({ claimId: id });

      let totalAmount = 0;
      for (const item of items) {
        const expenseItem = this.itemRepo.create({
          claimId: id,
          categoryId: item.categoryId,
          txnDate: new Date(item.txnDate),
          amount: item.amount,
          currencyCode: item.currencyCode || currencyCode,
          merchant: item.merchant,
          description: item.description,
          taxCodeId: item.taxCodeId,
          receiptUrl: item.receiptUrl,
          distanceKm: item.distanceKm,
        });

        await this.itemRepo.save(expenseItem);
        totalAmount += item.amount;
      }

      claim.totalAmount = totalAmount;
    }

    await this.claimRepo.save(claim);

    return this.getExpenseDetail(id);
  }

  @Post('expenses/:id/submit')
  @ApiOperation({ summary: 'Submit expense for approval' })
  async submitExpense(@Param('id') id: string, @Request() req) {
    const claim = await this.claimRepo.findOne({
      where: { id },
      relations: ['createdBy', 'items'],
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.status !== ClaimStatus.DRAFT) {
      throw new Error('Only DRAFT claims can be submitted');
    }

    // Update claim status
    claim.status = ClaimStatus.SUBMITTED;
    claim.submittedAt = new Date();
    await this.claimRepo.save(claim);

    // Create approval workflow
    const user = await this.userRepo.findOne({ where: { id: req.user.id } });
    
    // Level 1: Manager approval
    if (user?.managerId) {
      const approval = this.approvalRepo.create({
        claimId: id,
        approverId: user.managerId,
        level: 1,
        decision: ApprovalDecision.PENDING,
      });
      await this.approvalRepo.save(approval);
    }

    // Level 2: Finance approval if amount > 500
    if (claim.totalAmount > 500) {
      const financeUsers = await this.userRepo.find({
        where: { roles: ['FINANCE'] as any },
      });
      
      if (financeUsers.length > 0) {
        const approval = this.approvalRepo.create({
          claimId: id,
          approverId: financeUsers[0].id,
          level: 2,
          decision: ApprovalDecision.PENDING,
        });
        await this.approvalRepo.save(approval);
      }
    }

    return this.getExpenseDetail(id);
  }

  @Post('expenses/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.FINANCE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve expense' })
  async approveExpense(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { comment?: string },
  ) {
    const approval = await this.approvalRepo.findOne({
      where: {
        claimId: id,
        approverId: req.user.id,
        decision: ApprovalDecision.PENDING,
      },
    });

    if (!approval) {
      throw new Error('No pending approval found for this claim');
    }

    approval.decision = ApprovalDecision.APPROVED;
    approval.decidedAt = new Date();
    approval.comment = body.comment;
    await this.approvalRepo.save(approval);

    // Check if all approvals are complete
    const allApprovals = await this.approvalRepo.find({
      where: { claimId: id },
      order: { level: 'ASC' },
    });

    const allApproved = allApprovals.every(
      a => a.decision === ApprovalDecision.APPROVED
    );

    if (allApproved) {
      const claim = await this.claimRepo.findOne({ where: { id } });
      if (claim) {
        claim.status = ClaimStatus.APPROVED;
        claim.approvedAt = new Date();
        await this.claimRepo.save(claim);
      }
    }

    return this.getExpenseDetail(id);
  }

  @Post('expenses/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.FINANCE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject expense' })
  async rejectExpense(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { comment: string },
  ) {
    const approval = await this.approvalRepo.findOne({
      where: {
        claimId: id,
        approverId: req.user.id,
        decision: ApprovalDecision.PENDING,
      },
    });

    if (!approval) {
      throw new Error('No pending approval found for this claim');
    }

    approval.decision = ApprovalDecision.REJECTED;
    approval.decidedAt = new Date();
    approval.comment = body.comment;
    await this.approvalRepo.save(approval);

    // Update claim to rejected
    const claim = await this.claimRepo.findOne({ where: { id } });
    if (claim) {
      claim.status = ClaimStatus.REJECTED;
      await this.claimRepo.save(claim);
    }

    return this.getExpenseDetail(id);
  }

  @Post('expenses/:id/mark-paid')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FINANCE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark expense as paid (Finance only)' })
  async markAsPaid(@Param('id') id: string) {
    const claim = await this.claimRepo.findOne({ where: { id } });

    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.status !== ClaimStatus.APPROVED) {
      throw new Error('Only APPROVED claims can be marked as paid');
    }

    claim.status = ClaimStatus.PAID;
    claim.paidAt = new Date();
    await this.claimRepo.save(claim);

    return this.getExpenseDetail(id);
  }

  // Stats / Dashboard
  @Get('expenses/stats')
  @ApiOperation({ summary: 'Get expense statistics' })
  async getStats(@Request() req) {
    const [totalExpenses, draft, submitted, approved, rejected, paid] = await Promise.all([
      this.expenseRepo.count(),
      this.expenseRepo.count({ where: { status: ExpenseStatus.DRAFT } }),
      this.expenseRepo.count({ where: { status: ExpenseStatus.SUBMITTED } }),
      this.expenseRepo.count({ where: { status: ExpenseStatus.APPROVED } }),
      this.expenseRepo.count({ where: { status: ExpenseStatus.REJECTED } }),
      this.expenseRepo.count({ where: { status: ExpenseStatus.PAID } }),
    ]);

    const approvedExpenses = await this.expenseRepo.find({
      where: { status: ExpenseStatus.APPROVED },
    });

    const paidExpenses = await this.expenseRepo.find({
      where: { status: ExpenseStatus.PAID },
    });

    const approvedAmount = approvedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const paidAmount = paidExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      totalClaims: totalExpenses,
      byStatus: {
        draft,
        submitted,
        approved,
        rejected,
        paid,
      },
      amounts: {
        approved: approvedAmount,
        paid: paidAmount,
      },
    };
  }

  // Approvals
  @Get('approvals')
  @ApiOperation({ summary: 'Get approvals for current user' })
  async getMyApprovals(
    @Request() req,
    @Query('me') me?: string,
    @Query('decision') decision?: string,
  ) {
    const where: any = {};

    if (me === '1' && req.user?.id) {
      where.approverId = req.user.id;
    }

    if (decision) {
      where.decision = decision.toUpperCase();
    }

    return this.approvalRepo.find({
      where,
      relations: ['claim', 'claim.createdBy', 'claim.items'],
      order: { createdAt: 'DESC' },
    });
  }
}
