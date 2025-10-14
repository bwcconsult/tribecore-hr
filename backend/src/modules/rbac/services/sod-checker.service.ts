import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { AccessAuditLog, AuditAction, RiskLevel } from '../entities/access-audit-log.entity';

export interface SoDViolation {
  userId: string;
  userName: string;
  conflictingRoles: Array<{
    roleId: string;
    roleName: string;
    conflictsWith: string;
  }>;
  riskLevel: RiskLevel;
  detectedAt: Date;
  recommendations: string[];
}

/**
 * Separation of Duties (SoD) Checker Service
 * Prevents users from holding conflicting roles that could enable fraud or policy breaches
 * 
 * Examples of SoD violations:
 * - Same user processing AND approving payroll
 * - Recruiter creating offers AND approving budget
 * - IT admin with access to financial data
 */
@Injectable()
export class SoDCheckerService {
  private readonly logger = new Logger(SoDCheckerService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(AccessAuditLog)
    private readonly auditRepo: Repository<AccessAuditLog>,
  ) {}

  /**
   * Check if assigning a new role would create SoD violation
   */
  async checkRoleAssignment(userId: string, newRoleId: string): Promise<{
    allowed: boolean;
    violations: SoDViolation[];
    warnings: string[];
  }> {
    try {
      // Get user's current roles
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      if (!user) {
        return { allowed: false, violations: [], warnings: ['User not found'] };
      }

      // Get the new role
      const newRole = await this.roleRepo.findOne({
        where: { id: newRoleId },
      });

      if (!newRole) {
        return { allowed: false, violations: [], warnings: ['Role not found'] };
      }

      const violations: SoDViolation[] = [];
      const warnings: string[] = [];

      // Check if new role conflicts with existing roles
      for (const existingRole of user.roles || []) {
        // Check if new role is incompatible with existing role
        if (newRole.incompatibleRoles?.includes(existingRole.code)) {
          violations.push({
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            conflictingRoles: [
              {
                roleId: existingRole.id,
                roleName: existingRole.name,
                conflictsWith: newRole.code,
              },
            ],
            riskLevel: RiskLevel.HIGH,
            detectedAt: new Date(),
            recommendations: [
              `Remove ${existingRole.name} before assigning ${newRole.name}`,
              'Request approval from compliance officer',
              'Document business justification for override',
            ],
          });
        }

        // Check reverse compatibility
        if (existingRole.incompatibleRoles?.includes(newRole.code)) {
          violations.push({
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            conflictingRoles: [
              {
                roleId: newRole.id,
                roleName: newRole.name,
                conflictsWith: existingRole.code,
              },
            ],
            riskLevel: RiskLevel.HIGH,
            detectedAt: new Date(),
            recommendations: [
              `${newRole.name} is incompatible with ${existingRole.name}`,
              'Choose one role or request compliance approval',
            ],
          });
        }
      }

      // Check for common SoD patterns
      const sodPatterns = this.checkCommonSoDPatterns(user.roles || [], newRole);
      warnings.push(...sodPatterns);

      // Log if violations found
      if (violations.length > 0) {
        await this.logSoDViolation(user.id, violations);
      }

      return {
        allowed: violations.length === 0,
        violations,
        warnings,
      };
    } catch (error) {
      this.logger.error(`SoD check failed: ${error.message}`, error.stack);
      return {
        allowed: false,
        violations: [],
        warnings: ['Error checking for conflicts'],
      };
    }
  }

  /**
   * Scan all users for SoD violations
   */
  async scanAllUsers(): Promise<SoDViolation[]> {
    const violations: SoDViolation[] = [];

    try {
      const users = await this.userRepo.find({
        where: { isActive: true },
        relations: ['roles'],
      });

      for (const user of users) {
        if (!user.roles || user.roles.length < 2) continue;

        // Check each pair of roles
        for (let i = 0; i < user.roles.length; i++) {
          for (let j = i + 1; j < user.roles.length; j++) {
            const role1 = user.roles[i];
            const role2 = user.roles[j];

            // Check mutual incompatibility
            if (role1.incompatibleRoles?.includes(role2.code)) {
              violations.push({
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`,
                conflictingRoles: [
                  {
                    roleId: role1.id,
                    roleName: role1.name,
                    conflictsWith: role2.code,
                  },
                  {
                    roleId: role2.id,
                    roleName: role2.name,
                    conflictsWith: role1.code,
                  },
                ],
                riskLevel: RiskLevel.CRITICAL,
                detectedAt: new Date(),
                recommendations: [
                  'Immediate action required',
                  'Remove one of the conflicting roles',
                  'Notify compliance team',
                ],
              });
            }
          }
        }
      }

      // Log summary
      if (violations.length > 0) {
        this.logger.warn(`Found ${violations.length} SoD violations across ${users.length} users`);
      }

      return violations;
    } catch (error) {
      this.logger.error(`SoD scan failed: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Get SoD violations for a specific user
   */
  async getUserViolations(userId: string): Promise<SoDViolation[]> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      if (!user || !user.roles || user.roles.length < 2) {
        return [];
      }

      const violations: SoDViolation[] = [];

      // Check each pair of roles
      for (let i = 0; i < user.roles.length; i++) {
        for (let j = i + 1; j < user.roles.length; j++) {
          const role1 = user.roles[i];
          const role2 = user.roles[j];

          if (role1.incompatibleRoles?.includes(role2.code) || role2.incompatibleRoles?.includes(role1.code)) {
            violations.push({
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              conflictingRoles: [
                { roleId: role1.id, roleName: role1.name, conflictsWith: role2.code },
                { roleId: role2.id, roleName: role2.name, conflictsWith: role1.code },
              ],
              riskLevel: RiskLevel.HIGH,
              detectedAt: new Date(),
              recommendations: ['Remove one of the conflicting roles'],
            });
          }
        }
      }

      return violations;
    } catch (error) {
      this.logger.error(`Failed to get user violations: ${error.message}`);
      return [];
    }
  }

  /**
   * Check common SoD anti-patterns
   */
  private checkCommonSoDPatterns(existingRoles: Role[], newRole: Role): string[] {
    const warnings: string[] = [];
    const roleNames = [...existingRoles.map(r => r.code), newRole.code];

    // Payroll + Finance conflicts
    if (roleNames.includes('PAYROLL_ADMIN') && roleNames.includes('PAYROLL_APPROVER')) {
      warnings.push('Warning: Same user processing and approving payroll creates audit risk');
    }

    // Recruitment + Finance
    if (roleNames.includes('RECRUITER') && roleNames.includes('FINANCE_APPROVER')) {
      warnings.push('Warning: Recruiter with finance approval can bypass hiring budget controls');
    }

    // IT Admin + Financial Data
    if (roleNames.includes('SYSTEM_ADMIN') && (roleNames.includes('PAYROLL_ADMIN') || roleNames.includes('FINANCE_OFFICER'))) {
      warnings.push('Warning: IT admin with financial data access increases fraud risk');
    }

    // HR Admin + Manager (for same employees)
    if (roleNames.includes('HR_ADMIN') && roleNames.includes('MANAGER')) {
      warnings.push('Note: Manager with HR admin rights for own team should be monitored');
    }

    return warnings;
  }

  /**
   * Log SoD violation to audit trail
   */
  private async logSoDViolation(userId: string, violations: SoDViolation[]): Promise<void> {
    try {
      await this.auditRepo.save({
        userId,
        action: AuditAction.SOD_VIOLATION_DETECTED,
        description: `SoD violation detected: ${violations.length} conflicts found`,
        success: false,
        riskLevel: RiskLevel.CRITICAL,
        flaggedForReview: true,
        metadata: {
          violations: violations.map(v => ({
            roles: v.conflictingRoles.map(r => r.roleName),
            recommendations: v.recommendations,
          })),
        },
        ipAddress: 'system',
      });
    } catch (error) {
      this.logger.error(`Failed to log SoD violation: ${error.message}`);
    }
  }

  /**
   * Define standard incompatible role pairs
   */
  async initializeStandardSoDRules(): Promise<void> {
    try {
      // Define standard incompatibilities
      const incompatibilities: Record<string, string[]> = {
        PAYROLL_ADMIN: ['PAYROLL_APPROVER', 'FINANCE_AUDITOR'],
        PAYROLL_APPROVER: ['PAYROLL_ADMIN'],
        RECRUITER: ['FINANCE_APPROVER', 'BUDGET_APPROVER'],
        SYSTEM_ADMIN: ['PAYROLL_ADMIN', 'FINANCE_OFFICER', 'AUDITOR'],
        FINANCE_OFFICER: ['SYSTEM_ADMIN'],
        AUDITOR: ['SYSTEM_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN'],
      };

      // Update roles with incompatibilities
      for (const [roleCode, incompatibleCodes] of Object.entries(incompatibilities)) {
        await this.roleRepo.update(
          { code: roleCode },
          { incompatibleRoles: incompatibleCodes }
        );
      }

      this.logger.log('Standard SoD rules initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize SoD rules: ${error.message}`);
    }
  }
}
