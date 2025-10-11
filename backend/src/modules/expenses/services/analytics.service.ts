import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ExpenseClaim } from '../entities/expense-claim.entity';
import { ExpenseItem } from '../entities/expense-item.entity';
import { Approval } from '../entities/approval.entity';
import { ExpenseStatus } from '../enums/expense-status.enum';

export interface AnalyticsOverview {
  totalSpend: number;
  claimCount: number;
  averageClaimAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  rejectedAmount: number;
  topCategory: string;
  topCategoryAmount: number;
  currentMonthSpend: number;
  lastMonthSpend: number;
  percentageChange: number;
}

export interface TrendData {
  month: string;
  totalAmount: number;
  claimCount: number;
  averageAmount: number;
}

export interface CategoryBreakdown {
  categoryName: string;
  categoryCode: string;
  totalAmount: number;
  claimCount: number;
  percentage: number;
}

export interface EmployeeSpending {
  employeeId: string;
  employeeName: string;
  totalSpend: number;
  claimCount: number;
  averageClaimAmount: number;
}

export interface ApprovalMetrics {
  totalApprovals: number;
  pendingApprovals: number;
  approvedCount: number;
  rejectedCount: number;
  averageApprovalTime: number; // in hours
  approvalRate: number; // percentage
  rejectionRate: number; // percentage
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ExpenseClaim)
    private claimRepository: Repository<ExpenseClaim>,
    @InjectRepository(ExpenseItem)
    private itemRepository: Repository<ExpenseItem>,
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
  ) {}

  async getOverview(
    startDate?: Date,
    endDate?: Date,
    departmentId?: string,
    employeeId?: string,
  ): Promise<AnalyticsOverview> {
    const queryBuilder = this.claimRepository.createQueryBuilder('claim');

    if (startDate && endDate) {
      queryBuilder.andWhere('claim.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (departmentId) {
      queryBuilder.andWhere('claim.departmentId = :departmentId', { departmentId });
    }

    if (employeeId) {
      queryBuilder.andWhere('claim.employeeId = :employeeId', { employeeId });
    }

    const claims = await queryBuilder.getMany();

    const totalSpend = claims.reduce((sum, claim) => sum + Number(claim.totalAmount), 0);
    const claimCount = claims.length;
    const averageClaimAmount = claimCount > 0 ? totalSpend / claimCount : 0;

    const pendingAmount = claims
      .filter(c => c.status === ExpenseStatus.SUBMITTED || c.status === ExpenseStatus.UNDER_REVIEW)
      .reduce((sum, claim) => sum + Number(claim.totalAmount), 0);

    const approvedAmount = claims
      .filter(c => c.status === ExpenseStatus.APPROVED)
      .reduce((sum, claim) => sum + Number(claim.totalAmount), 0);

    const paidAmount = claims
      .filter(c => c.status === ExpenseStatus.PAID)
      .reduce((sum, claim) => sum + Number(claim.totalAmount), 0);

    const rejectedAmount = claims
      .filter(c => c.status === ExpenseStatus.REJECTED)
      .reduce((sum, claim) => sum + Number(claim.totalAmount), 0);

    // Get top category
    const categoryTotals = await this.getCategoryBreakdown(startDate, endDate, departmentId, employeeId);
    const topCategory = categoryTotals[0] || { categoryName: 'N/A', totalAmount: 0 };

    // Calculate monthly comparison
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthClaims = await this.claimRepository
      .createQueryBuilder('claim')
      .where('claim.createdAt >= :start', { start: currentMonthStart })
      .getMany();

    const lastMonthClaims = await this.claimRepository
      .createQueryBuilder('claim')
      .where('claim.createdAt BETWEEN :start AND :end', {
        start: lastMonthStart,
        end: lastMonthEnd,
      })
      .getMany();

    const currentMonthSpend = currentMonthClaims.reduce(
      (sum, claim) => sum + Number(claim.totalAmount),
      0,
    );
    const lastMonthSpend = lastMonthClaims.reduce((sum, claim) => sum + Number(claim.totalAmount), 0);

    const percentageChange =
      lastMonthSpend > 0 ? ((currentMonthSpend - lastMonthSpend) / lastMonthSpend) * 100 : 0;

    return {
      totalSpend,
      claimCount,
      averageClaimAmount,
      pendingAmount,
      approvedAmount,
      paidAmount,
      rejectedAmount,
      topCategory: topCategory.categoryName,
      topCategoryAmount: topCategory.totalAmount,
      currentMonthSpend,
      lastMonthSpend,
      percentageChange,
    };
  }

  async getTrends(
    months: number = 12,
    departmentId?: string,
    employeeId?: string,
  ): Promise<TrendData[]> {
    const trends: TrendData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const queryBuilder = this.claimRepository
        .createQueryBuilder('claim')
        .where('claim.createdAt BETWEEN :start AND :end', {
          start: monthStart,
          end: monthEnd,
        });

      if (departmentId) {
        queryBuilder.andWhere('claim.departmentId = :departmentId', { departmentId });
      }

      if (employeeId) {
        queryBuilder.andWhere('claim.employeeId = :employeeId', { employeeId });
      }

      const claims = await queryBuilder.getMany();

      const totalAmount = claims.reduce((sum, claim) => sum + Number(claim.totalAmount), 0);
      const claimCount = claims.length;
      const averageAmount = claimCount > 0 ? totalAmount / claimCount : 0;

      trends.push({
        month: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        totalAmount,
        claimCount,
        averageAmount,
      });
    }

    return trends;
  }

  async getCategoryBreakdown(
    startDate?: Date,
    endDate?: Date,
    departmentId?: string,
    employeeId?: string,
  ): Promise<CategoryBreakdown[]> {
    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoin('item.claim', 'claim')
      .select('category.name', 'categoryName')
      .addSelect('category.code', 'categoryCode')
      .addSelect('SUM(item.amount)', 'totalAmount')
      .addSelect('COUNT(DISTINCT item.claimId)', 'claimCount')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.code')
      .orderBy('totalAmount', 'DESC');

    if (startDate && endDate) {
      queryBuilder.andWhere('claim.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (departmentId) {
      queryBuilder.andWhere('claim.departmentId = :departmentId', { departmentId });
    }

    if (employeeId) {
      queryBuilder.andWhere('claim.employeeId = :employeeId', { employeeId });
    }

    const results = await queryBuilder.getRawMany();

    const totalSpend = results.reduce((sum, r) => sum + Number(r.totalAmount), 0);

    return results.map(r => ({
      categoryName: r.categoryName,
      categoryCode: r.categoryCode,
      totalAmount: Number(r.totalAmount),
      claimCount: Number(r.claimCount),
      percentage: totalSpend > 0 ? (Number(r.totalAmount) / totalSpend) * 100 : 0,
    }));
  }

  async getTopSpenders(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
    departmentId?: string,
  ): Promise<EmployeeSpending[]> {
    const queryBuilder = this.claimRepository
      .createQueryBuilder('claim')
      .leftJoin('claim.employee', 'employee')
      .select('employee.id', 'employeeId')
      .addSelect("CONCAT(employee.firstName, ' ', employee.lastName)", 'employeeName')
      .addSelect('SUM(claim.totalAmount)', 'totalSpend')
      .addSelect('COUNT(claim.id)', 'claimCount')
      .addSelect('AVG(claim.totalAmount)', 'averageClaimAmount')
      .groupBy('employee.id')
      .addGroupBy('employee.firstName')
      .addGroupBy('employee.lastName')
      .orderBy('totalSpend', 'DESC')
      .limit(limit);

    if (startDate && endDate) {
      queryBuilder.andWhere('claim.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (departmentId) {
      queryBuilder.andWhere('claim.departmentId = :departmentId', { departmentId });
    }

    const results = await queryBuilder.getRawMany();

    return results.map(r => ({
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      totalSpend: Number(r.totalSpend),
      claimCount: Number(r.claimCount),
      averageClaimAmount: Number(r.averageClaimAmount),
    }));
  }

  async getApprovalMetrics(
    startDate?: Date,
    endDate?: Date,
    approverId?: string,
  ): Promise<ApprovalMetrics> {
    const queryBuilder = this.approvalRepository.createQueryBuilder('approval');

    if (startDate && endDate) {
      queryBuilder.andWhere('approval.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (approverId) {
      queryBuilder.andWhere('approval.approverId = :approverId', { approverId });
    }

    const approvals = await queryBuilder.getMany();

    const totalApprovals = approvals.length;
    const pendingApprovals = approvals.filter(a => a.status === 'PENDING').length;
    const approvedCount = approvals.filter(a => a.status === 'APPROVED').length;
    const rejectedCount = approvals.filter(a => a.status === 'REJECTED').length;

    // Calculate average approval time for completed approvals
    const completedApprovals = approvals.filter(a => a.reviewedAt);
    const approvalTimes = completedApprovals.map(a => {
      const created = new Date(a.createdAt).getTime();
      const reviewed = new Date(a.reviewedAt).getTime();
      return (reviewed - created) / (1000 * 60 * 60); // Convert to hours
    });

    const averageApprovalTime =
      approvalTimes.length > 0
        ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length
        : 0;

    const approvalRate = totalApprovals > 0 ? (approvedCount / totalApprovals) * 100 : 0;
    const rejectionRate = totalApprovals > 0 ? (rejectedCount / totalApprovals) * 100 : 0;

    return {
      totalApprovals,
      pendingApprovals,
      approvedCount,
      rejectedCount,
      averageApprovalTime,
      approvalRate,
      rejectionRate,
    };
  }

  async getDepartmentComparison(
    startDate?: Date,
    endDate?: Date,
  ): Promise<Array<{ departmentId: string; totalSpend: number; claimCount: number }>> {
    const queryBuilder = this.claimRepository
      .createQueryBuilder('claim')
      .select('claim.departmentId', 'departmentId')
      .addSelect('SUM(claim.totalAmount)', 'totalSpend')
      .addSelect('COUNT(claim.id)', 'claimCount')
      .where('claim.departmentId IS NOT NULL')
      .groupBy('claim.departmentId')
      .orderBy('totalSpend', 'DESC');

    if (startDate && endDate) {
      queryBuilder.andWhere('claim.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const results = await queryBuilder.getRawMany();

    return results.map(r => ({
      departmentId: r.departmentId,
      totalSpend: Number(r.totalSpend),
      claimCount: Number(r.claimCount),
    }));
  }

  async getPolicyViolations(
    startDate?: Date,
    endDate?: Date,
  ): Promise<Array<{ violationType: string; count: number }>> {
    const queryBuilder = this.claimRepository
      .createQueryBuilder('claim')
      .where('claim.hasPolicyViolations = :hasViolations', { hasViolations: true });

    if (startDate && endDate) {
      queryBuilder.andWhere('claim.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const claims = await queryBuilder.getMany();

    // Aggregate violations by type
    const violationCounts: { [key: string]: number } = {};

    claims.forEach(claim => {
      if (claim.policyViolations && Array.isArray(claim.policyViolations)) {
        claim.policyViolations.forEach((violation: any) => {
          const rule = violation.rule || 'Unknown';
          violationCounts[rule] = (violationCounts[rule] || 0) + 1;
        });
      }
    });

    return Object.entries(violationCounts)
      .map(([violationType, count]) => ({ violationType, count }))
      .sort((a, b) => b.count - a.count);
  }
}
