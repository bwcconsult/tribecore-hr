import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Role, RoleCategory } from '../entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { RoleDelegation, DelegationStatus } from '../entities/role-delegation.entity';
import { AccessAuditLog, RiskLevel } from '../entities/access-audit-log.entity';

export interface RoleDistribution {
  roleId: string;
  roleName: string;
  category: RoleCategory;
  userCount: number;
  percentage: number;
}

export interface DormantUser {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  lastLoginAt: Date;
  daysSinceLogin: number;
  riskLevel: RiskLevel;
}

export interface RoleUsageStats {
  roleId: string;
  roleName: string;
  assignedUsers: number;
  activeUsers: number;
  dormantUsers: number;
  delegationCount: number;
  lastUsed: Date;
  utilizationRate: number; // Percentage of assigned users who are active
}

export interface AccessPattern {
  userId: string;
  userName: string;
  module: string;
  accessCount: number;
  lastAccess: Date;
  anomalyScore: number; // 0-100, higher = more unusual
}

/**
 * Role Analytics Service
 * Provides insights and metrics for IAM governance
 */
@Injectable()
export class RoleAnalyticsService {
  private readonly logger = new Logger(RoleAnalyticsService.name);
  private readonly DORMANT_THRESHOLD_DAYS = 90;

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RoleDelegation)
    private readonly delegationRepo: Repository<RoleDelegation>,
    @InjectRepository(AccessAuditLog)
    private readonly auditRepo: Repository<AccessAuditLog>,
  ) {}

  /**
   * Get role distribution across organization
   */
  async getRoleDistribution(): Promise<RoleDistribution[]> {
    try {
      const roles = await this.roleRepo.find({
        where: { isActive: true },
      });

      const totalUsers = await this.userRepo.count({ where: { isActive: true } });

      const distribution: RoleDistribution[] = [];

      for (const role of roles) {
        const userCount = await this.userRepo
          .createQueryBuilder('user')
          .innerJoin('user.roles', 'role')
          .where('role.id = :roleId', { roleId: role.id })
          .andWhere('user.isActive = true')
          .getCount();

        distribution.push({
          roleId: role.id,
          roleName: role.name,
          category: role.category,
          userCount,
          percentage: totalUsers > 0 ? (userCount / totalUsers) * 100 : 0,
        });
      }

      return distribution.sort((a, b) => b.userCount - a.userCount);
    } catch (error) {
      this.logger.error(`Failed to get role distribution: ${error.message}`);
      return [];
    }
  }

  /**
   * Find dormant users (not logged in for X days)
   */
  async findDormantUsers(): Promise<DormantUser[]> {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - this.DORMANT_THRESHOLD_DAYS);

      const users = await this.userRepo.find({
        where: {
          isActive: true,
          lastLoginAt: LessThan(thresholdDate),
        },
        relations: ['roles'],
      });

      const dormantUsers: DormantUser[] = users.map(user => {
        const daysSinceLogin = Math.floor(
          (new Date().getTime() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        let riskLevel = RiskLevel.LOW;
        if (daysSinceLogin > 180) riskLevel = RiskLevel.CRITICAL;
        else if (daysSinceLogin > 120) riskLevel = RiskLevel.HIGH;
        else if (daysSinceLogin > 90) riskLevel = RiskLevel.MEDIUM;

        return {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          roles: user.roles?.map(r => r.name) || [],
          lastLoginAt: user.lastLoginAt,
          daysSinceLogin,
          riskLevel,
        };
      });

      return dormantUsers.sort((a, b) => b.daysSinceLogin - a.daysSinceLogin);
    } catch (error) {
      this.logger.error(`Failed to find dormant users: ${error.message}`);
      return [];
    }
  }

  /**
   * Get role usage statistics
   */
  async getRoleUsageStats(): Promise<RoleUsageStats[]> {
    try {
      const roles = await this.roleRepo.find({ where: { isActive: true } });
      const stats: RoleUsageStats[] = [];

      const activeThreshold = new Date();
      activeThreshold.setDate(activeThreshold.getDate() - 30);

      for (const role of roles) {
        // Count assigned users
        const assignedUsers = await this.userRepo
          .createQueryBuilder('user')
          .innerJoin('user.roles', 'role')
          .where('role.id = :roleId', { roleId: role.id })
          .andWhere('user.isActive = true')
          .getCount();

        // Count active users (logged in last 30 days)
        const activeUsers = await this.userRepo
          .createQueryBuilder('user')
          .innerJoin('user.roles', 'role')
          .where('role.id = :roleId', { roleId: role.id })
          .andWhere('user.isActive = true')
          .andWhere('user.lastLoginAt > :threshold', { threshold: activeThreshold })
          .getCount();

        // Count delegations
        const delegationCount = await this.delegationRepo.count({
          where: { roleId: role.id, status: DelegationStatus.ACTIVE },
        });

        // Get last usage
        const lastAudit = await this.auditRepo.findOne({
          where: { module: role.name },
          order: { timestamp: 'DESC' },
        });

        stats.push({
          roleId: role.id,
          roleName: role.name,
          assignedUsers,
          activeUsers,
          dormantUsers: assignedUsers - activeUsers,
          delegationCount,
          lastUsed: lastAudit?.timestamp || role.createdAt,
          utilizationRate: assignedUsers > 0 ? (activeUsers / assignedUsers) * 100 : 0,
        });
      }

      return stats.sort((a, b) => b.assignedUsers - a.assignedUsers);
    } catch (error) {
      this.logger.error(`Failed to get role usage stats: ${error.message}`);
      return [];
    }
  }

  /**
   * Detect unusual access patterns (anomaly detection)
   */
  async detectAnomalies(days: number = 7): Promise<AccessPattern[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get access logs
      const logs = await this.auditRepo
        .createQueryBuilder('log')
        .where('log.timestamp > :startDate', { startDate })
        .andWhere('log.success = true')
        .getMany();

      // Calculate baseline access per user per module
      const userModuleAccess = new Map<string, Map<string, number>>();

      for (const log of logs) {
        if (!log.module) continue;

        if (!userModuleAccess.has(log.userId)) {
          userModuleAccess.set(log.userId, new Map());
        }

        const userMap = userModuleAccess.get(log.userId)!;
        const currentCount = userMap.get(log.module) || 0;
        userMap.set(log.module, currentCount + 1);
      }

      // Find anomalies (access count > 2x standard deviation)
      const anomalies: AccessPattern[] = [];

      for (const [userId, modules] of userModuleAccess.entries()) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) continue;

        for (const [module, count] of modules.entries()) {
          // Calculate average access for this module across all users
          let totalAccess = 0;
          let userCount = 0;

          for (const [, userModules] of userModuleAccess.entries()) {
            if (userModules.has(module)) {
              totalAccess += userModules.get(module)!;
              userCount++;
            }
          }

          const avgAccess = totalAccess / userCount;
          const stdDev = Math.sqrt(
            Array.from(userModuleAccess.values())
              .map(m => (m.get(module) || 0) - avgAccess)
              .reduce((sum, diff) => sum + diff * diff, 0) / userCount
          );

          // Flag if > 2 standard deviations above mean
          const anomalyScore = stdDev > 0 ? ((count - avgAccess) / stdDev) * 100 : 0;

          if (anomalyScore > 200) {
            // 2+ std deviations
            const lastAccess = logs
              .filter(l => l.userId === userId && l.module === module)
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

            anomalies.push({
              userId,
              userName: `${user.firstName} ${user.lastName}`,
              module,
              accessCount: count,
              lastAccess: lastAccess.timestamp,
              anomalyScore: Math.min(100, anomalyScore / 10), // Normalize to 0-100
            });
          }
        }
      }

      return anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
    } catch (error) {
      this.logger.error(`Failed to detect anomalies: ${error.message}`);
      return [];
    }
  }

  /**
   * Get comprehensive IAM dashboard metrics
   */
  async getDashboardMetrics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalRoles: number;
    activeDelegations: number;
    pendingApprovals: number;
    dormantUsers: number;
    sodViolations: number;
    highRiskActions: number;
    roleDistribution: RoleDistribution[];
    topAccessedModules: Array<{ module: string; count: number }>;
  }> {
    try {
      const [
        totalUsers,
        activeUsers,
        totalRoles,
        activeDelegations,
        pendingApprovals,
        dormantUsers,
        highRiskActions,
      ] = await Promise.all([
        this.userRepo.count(),
        this.userRepo.count({ where: { isActive: true } }),
        this.roleRepo.count({ where: { isActive: true } }),
        this.delegationRepo.count({ where: { status: DelegationStatus.ACTIVE } }),
        this.delegationRepo.count({ where: { status: DelegationStatus.PENDING } }),
        this.userRepo.count({
          where: {
            isActive: true,
            lastLoginAt: LessThan(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
          },
        }),
        this.auditRepo.count({
          where: { riskLevel: RiskLevel.HIGH },
        }),
      ]);

      // Get role distribution
      const roleDistribution = await this.getRoleDistribution();

      // Get top accessed modules
      const logs = await this.auditRepo
        .createQueryBuilder('log')
        .select('log.module', 'module')
        .addSelect('COUNT(*)', 'count')
        .where('log.timestamp > :date', { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
        .andWhere('log.module IS NOT NULL')
        .groupBy('log.module')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      const topAccessedModules = logs.map(l => ({
        module: l.module,
        count: parseInt(l.count),
      }));

      return {
        totalUsers,
        activeUsers,
        totalRoles,
        activeDelegations,
        pendingApprovals,
        dormantUsers,
        sodViolations: 0, // To be calculated from SoD checker
        highRiskActions,
        roleDistribution,
        topAccessedModules,
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate audit report for compliance
   */
  async generateAuditReport(startDate: Date, endDate: Date): Promise<{
    period: { start: Date; end: Date };
    totalActions: number;
    deniedAccess: number;
    highRiskActions: number;
    roleChanges: number;
    delegationActivity: number;
    topUsers: Array<{ userId: string; userName: string; actionCount: number }>;
    topActions: Array<{ action: string; count: number }>;
  }> {
    try {
      const logs = await this.auditRepo.find({
        where: {
          timestamp: LessThan(endDate),
        },
        relations: ['user'],
      });

      const filtered = logs.filter(l => l.timestamp >= startDate && l.timestamp <= endDate);

      const deniedAccess = filtered.filter(l => !l.success).length;
      const highRiskActions = filtered.filter(l => l.riskLevel === RiskLevel.HIGH || l.riskLevel === RiskLevel.CRITICAL).length;
      const roleChanges = filtered.filter(l => 
        l.action.toString().includes('ROLE') || l.action.toString().includes('PERMISSION')
      ).length;
      const delegationActivity = filtered.filter(l =>
        l.action.toString().includes('DELEGATION')
      ).length;

      // Top users
      const userCounts = new Map<string, { name: string; count: number }>();
      for (const log of filtered) {
        const current = userCounts.get(log.userId) || { name: '', count: 0 };
        current.count++;
        if (log.user) {
          current.name = `${log.user.firstName} ${log.user.lastName}`;
        }
        userCounts.set(log.userId, current);
      }

      const topUsers = Array.from(userCounts.entries())
        .map(([userId, data]) => ({
          userId,
          userName: data.name,
          actionCount: data.count,
        }))
        .sort((a, b) => b.actionCount - a.actionCount)
        .slice(0, 10);

      // Top actions
      const actionCounts = new Map<string, number>();
      for (const log of filtered) {
        const current = actionCounts.get(log.action) || 0;
        actionCounts.set(log.action, current + 1);
      }

      const topActions = Array.from(actionCounts.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        period: { start: startDate, end: endDate },
        totalActions: filtered.length,
        deniedAccess,
        highRiskActions,
        roleChanges,
        delegationActivity,
        topUsers,
        topActions,
      };
    } catch (error) {
      this.logger.error(`Failed to generate audit report: ${error.message}`);
      throw error;
    }
  }
}
