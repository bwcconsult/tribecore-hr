import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseClaim } from '../entities/expense-claim.entity';
import { Trip } from '../entities/trip.entity';
import { Advance } from '../entities/advance.entity';
import { Reimbursement } from '../entities/reimbursement.entity';
import { CorpCardTxn } from '../entities/corp-card-txn.entity';
import { Budget } from '../entities/budget.entity';
import { PolicyRule } from '../entities/policy-rule.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(ExpenseClaim)
    private readonly expenseClaimRepository: Repository<ExpenseClaim>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Advance)
    private readonly advanceRepository: Repository<Advance>,
    @InjectRepository(Reimbursement)
    private readonly reimbursementRepository: Repository<Reimbursement>,
    @InjectRepository(CorpCardTxn)
    private readonly corpCardRepository: Repository<CorpCardTxn>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(PolicyRule)
    private readonly policyRuleRepository: Repository<PolicyRule>,
  ) {}

  async getOverallSummary(fiscalYear?: string): Promise<any> {
    const currentYear = fiscalYear || new Date().getFullYear().toString();

    // Total Expenses
    const totalExpenses = await this.expenseClaimRepository
      .createQueryBuilder('claim')
      .select('SUM(claim.totalAmount)', 'sum')
      .where('YEAR(claim.submittedAt) = :year', { year: currentYear })
      .andWhere('claim.status != :status', { status: 'draft' })
      .getRawOne();

    // Advances
    const advances = await this.advanceRepository
      .createQueryBuilder('advance')
      .select('SUM(advance.amount)', 'sum')
      .where('YEAR(advance.date) = :year', { year: currentYear })
      .getRawOne();

    // Reimbursements
    const reimbursements = await this.reimbursementRepository
      .createQueryBuilder('reimb')
      .select('SUM(reimb.amount)', 'sum')
      .where('YEAR(reimb.createdAt) = :year', { year: currentYear })
      .getRawOne();

    // Total Trips
    const totalTrips = await this.tripRepository
      .createQueryBuilder('trip')
      .where('YEAR(trip.startDate) = :year', { year: currentYear })
      .getCount();

    return {
      totalExpenses: parseFloat(totalExpenses?.sum || '0'),
      advances: parseFloat(advances?.sum || '0'),
      reimbursements: parseFloat(reimbursements?.sum || '0'),
      totalTrips,
    };
  }

  async getSpendSummary(fiscalYear?: string): Promise<any> {
    const currentYear = fiscalYear || new Date().getFullYear().toString();

    const monthlySpend = await this.expenseClaimRepository
      .createQueryBuilder('claim')
      .select('MONTH(claim.submittedAt)', 'month')
      .addSelect('SUM(claim.totalAmount)', 'amount')
      .where('YEAR(claim.submittedAt) = :year', { year: currentYear })
      .andWhere('claim.status != :status', { status: 'draft' })
      .groupBy('MONTH(claim.submittedAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    return months.map((name, index) => {
      const data = monthlySpend.find(m => parseInt(m.month) === index + 1);
      return {
        month: name,
        amount: parseFloat(data?.amount || '0'),
      };
    });
  }

  async getPendingItems(): Promise<any> {
    // Pending Trips
    const pendingTrips = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.employee', 'employee')
      .where('trip.status = :status', { status: 'submitted' })
      .orderBy('trip.createdAt', 'DESC')
      .getMany();

    // Pending Reports (Expense Claims)
    const pendingReports = await this.expenseClaimRepository
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.employee', 'employee')
      .where('claim.status = :status', { status: 'pending_approval' })
      .orderBy('claim.submittedAt', 'DESC')
      .getMany();

    // For Reimbursement
    const forReimbursement = await this.expenseClaimRepository
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.employee', 'employee')
      .where('claim.status = :status', { status: 'approved' })
      .andWhere('claim.id NOT IN (SELECT expenseClaimId FROM reimbursements WHERE status = :paidStatus)', 
        { paidStatus: 'paid' })
      .orderBy('claim.approvedAt', 'DESC')
      .getMany();

    // Unreported Advances
    const unreportedAdvances = await this.advanceRepository
      .createQueryBuilder('advance')
      .leftJoinAndSelect('advance.employee', 'employee')
      .where('advance.status = :status', { status: 'unreported' })
      .orderBy('advance.createdAt', 'DESC')
      .getMany();

    return {
      pendingTrips: {
        count: pendingTrips.length,
        items: pendingTrips,
      },
      pendingReports: {
        forApproval: pendingReports.length,
        forReimbursement: forReimbursement.length,
        approvalItems: pendingReports,
        reimbursementItems: forReimbursement,
      },
      unreportedAdvances: {
        count: unreportedAdvances.length,
        items: unreportedAdvances,
        totalAmount: unreportedAdvances.reduce((sum, adv) => sum + parseFloat(adv.amount.toString()), 0),
      },
    };
  }

  async getCorporateCardSummary(): Promise<any> {
    // Active Cards
    const activeCards = await this.corpCardRepository
      .createQueryBuilder('card')
      .where('card.isActive = :active', { active: true })
      .getCount();

    // Unassigned Cards
    const unassignedCards = await this.corpCardRepository
      .createQueryBuilder('card')
      .where('card.employeeId IS NULL')
      .getCount();

    // Pending Submission
    const pendingSubmission = await this.corpCardRepository
      .createQueryBuilder('card')
      .where('card.status = :status', { status: 'pending_submission' })
      .getCount();

    // Unapproved
    const unapproved = await this.corpCardRepository
      .createQueryBuilder('card')
      .where('card.status = :status', { status: 'unapproved' })
      .getCount();

    return {
      activeCards,
      unassignedCards,
      pendingSubmission,
      unapproved,
    };
  }

  async getExpensesByCategory(period: string = 'month'): Promise<any> {
    const expenses = await this.expenseClaimRepository
      .createQueryBuilder('claim')
      .leftJoin('claim.items', 'item')
      .leftJoin('item.category', 'category')
      .select('category.name', 'category')
      .addSelect('SUM(item.amount)', 'amount')
      .where('claim.status != :status', { status: 'draft' })
      .groupBy('category.name')
      .orderBy('amount', 'DESC')
      .limit(10)
      .getRawMany();

    return expenses.map(e => ({
      category: e.category || 'Uncategorized',
      amount: parseFloat(e.amount || '0'),
    }));
  }

  async getExpensesByProject(period: string = 'month'): Promise<any> {
    const expenses = await this.expenseClaimRepository
      .createQueryBuilder('claim')
      .leftJoin('claim.project', 'project')
      .select('project.name', 'project')
      .addSelect('SUM(claim.totalAmount)', 'amount')
      .where('claim.status != :status', { status: 'draft' })
      .andWhere('claim.projectId IS NOT NULL')
      .groupBy('project.name')
      .orderBy('amount', 'DESC')
      .limit(10)
      .getRawMany();

    return expenses.map(e => ({
      project: e.project || 'Unassigned',
      amount: parseFloat(e.amount || '0'),
    }));
  }

  async getTopPolicyViolations(period: string = 'month'): Promise<any> {
    // This would need a violations tracking table
    // For now, return empty array
    return [];
  }

  async getTopSpendingUsers(limit: number = 10): Promise<any> {
    const users = await this.expenseClaimRepository
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.employee', 'employee')
      .select('claim.employeeId', 'employeeId')
      .addSelect('employee.name', 'name')
      .addSelect('SUM(claim.totalAmount)', 'amount')
      .where('claim.status != :status', { status: 'draft' })
      .groupBy('claim.employeeId')
      .addGroupBy('employee.name')
      .orderBy('amount', 'DESC')
      .limit(limit)
      .getRawMany();

    return users.map(u => ({
      employeeId: u.employeeId,
      name: u.name || 'Unknown',
      amount: parseFloat(u.amount || '0'),
    }));
  }

  async getTopViolators(limit: number = 10): Promise<any> {
    // This would need a violations tracking table
    // For now, return empty array
    return [];
  }
}
