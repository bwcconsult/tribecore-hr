import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RoleDelegation, DelegationStatus } from '../entities/role-delegation.entity';
import { User } from '../../users/entities/user.entity';
import { AccessAuditLog, AuditAction, RiskLevel } from '../entities/access-audit-log.entity';

export interface PolicyContext {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  attributes?: Record<string, any>; // ABAC attributes
  ipAddress?: string;
  userAgent?: string;
  requestUrl?: string;
}

export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  matchedPolicies?: string[];
  deniedBy?: string;
  requiresMFA?: boolean;
  fieldMask?: string[]; // Fields to hide
  recordFilters?: Record<string, any>; // Additional filters to apply
  riskLevel?: RiskLevel;
}

/**
 * Policy Evaluation Engine
 * Core RBAC + ABAC implementation
 * Evaluates whether a user can perform an action on a resource
 */
@Injectable()
export class PolicyEvaluationService {
  private readonly logger = new Logger(PolicyEvaluationService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(RoleDelegation)
    private readonly delegationRepo: Repository<RoleDelegation>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(AccessAuditLog)
    private readonly auditRepo: Repository<AccessAuditLog>,
  ) {}

  /**
   * Main policy evaluation entry point
   */
  async evaluatePolicy(context: PolicyContext): Promise<PolicyDecision> {
    try {
      // 1. Get user and their roles
      const user = await this.userRepo.findOne({
        where: { id: context.userId },
        relations: ['roles'],
      });

      if (!user) {
        return {
          allowed: false,
          reason: 'User not found',
          riskLevel: RiskLevel.HIGH,
        };
      }

      // 2. Check if user is active
      if (!user.isActive) {
        await this.logDeniedAccess(context, 'User account is inactive');
        return {
          allowed: false,
          reason: 'Account is inactive',
          riskLevel: RiskLevel.MEDIUM,
        };
      }

      // 3. Get all effective permissions (direct + delegated + inherited)
      const effectivePermissions = await this.getEffectivePermissions(user.id);

      // 4. Check if action is permitted
      const hasPermission = this.checkPermission(
        effectivePermissions,
        context.action,
        context.resource
      );

      if (!hasPermission) {
        await this.logDeniedAccess(context, 'Insufficient permissions');
        return {
          allowed: false,
          reason: 'You do not have permission to perform this action',
          riskLevel: RiskLevel.LOW,
        };
      }

      // 5. Apply ABAC rules (attribute-based filtering)
      const abacResult = await this.evaluateABAC(user, context, effectivePermissions);

      if (!abacResult.allowed) {
        await this.logDeniedAccess(context, abacResult.reason || 'ABAC policy violation');
        return abacResult;
      }

      // 6. Check time restrictions
      const timeCheck = this.checkTimeRestrictions(effectivePermissions);
      if (!timeCheck.allowed) {
        await this.logDeniedAccess(context, 'Access not allowed at this time');
        return timeCheck;
      }

      // 7. Check IP whitelist
      if (context.ipAddress) {
        const ipCheck = this.checkIPRestrictions(effectivePermissions, context.ipAddress);
        if (!ipCheck.allowed) {
          await this.logDeniedAccess(context, 'IP address not whitelisted');
          return ipCheck;
        }
      }

      // 8. Determine risk level
      const riskLevel = this.assessRiskLevel(context, effectivePermissions);

      // 9. Check if MFA required for high-risk actions
      const requiresMFA = this.checkMFARequirement(effectivePermissions, riskLevel);

      // 10. Log successful access
      await this.logAllowedAccess(context, riskLevel);

      // 11. Return decision with any field masks or filters
      return {
        allowed: true,
        matchedPolicies: effectivePermissions.map(p => p.name),
        requiresMFA,
        fieldMask: this.getFieldMasks(effectivePermissions, context.resource),
        recordFilters: abacResult.recordFilters,
        riskLevel,
      };
    } catch (error) {
      this.logger.error(`Policy evaluation error: ${error.message}`, error.stack);
      return {
        allowed: false,
        reason: 'Internal error during policy evaluation',
        riskLevel: RiskLevel.CRITICAL,
      };
    }
  }

  /**
   * Get all effective permissions for a user
   * Includes: direct roles + delegated roles + inherited permissions
   */
  private async getEffectivePermissions(userId: string): Promise<Permission[]> {
    const permissions = new Map<string, Permission>();

    // 1. Get direct role permissions
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (user?.roles) {
      for (const role of user.roles) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            permissions.set(permission.id, permission);
          }
        }
      }
    }

    // 2. Get delegated permissions
    const now = new Date();
    const activeDelegations = await this.delegationRepo.find({
      where: {
        delegateId: userId,
        status: DelegationStatus.ACTIVE,
      },
      relations: ['role', 'role.permissions'],
    });

    for (const delegation of activeDelegations) {
      // Check if delegation is currently valid
      if (delegation.startDate <= now && delegation.endDate >= now) {
        if (delegation.role?.permissions) {
          for (const permission of delegation.role.permissions) {
            permissions.set(permission.id, permission);
          }
        }
      }
    }

    return Array.from(permissions.values());
  }

  /**
   * Check if user has permission to perform action on resource
   */
  private checkPermission(
    permissions: Permission[],
    action: string,
    resource: string
  ): boolean {
    return permissions.some(
      (p) => p.feature === resource && p.action === action && p.isActive
    );
  }

  /**
   * Evaluate Attribute-Based Access Control (ABAC)
   */
  private async evaluateABAC(
    user: User,
    context: PolicyContext,
    permissions: Permission[]
  ): Promise<PolicyDecision> {
    const filters: Record<string, any> = {};

    // Check scope restrictions
    for (const permission of permissions) {
      if (permission.scope) {
        switch (permission.scope) {
          case 'self':
            filters.userId = user.id;
            break;
          case 'team':
            filters.managerId = user.id;
            break;
          case 'department':
            filters.department = user.department;
            break;
          case 'org':
            // No additional filters for org-wide access
            break;
        }
      }

      // Apply additional conditions from permission
      if (permission.conditions) {
        Object.assign(filters, permission.conditions);
      }
    }

    // Check attribute matching
    if (context.attributes) {
      // User can only access resources matching their attributes
      if (context.attributes.country && user.country && context.attributes.country !== user.country) {
        return {
          allowed: false,
          reason: 'Country restriction: You can only access resources in your assigned country',
          riskLevel: RiskLevel.MEDIUM,
        };
      }

      if (context.attributes.businessUnit && user.businessUnit && context.attributes.businessUnit !== user.businessUnit) {
        return {
          allowed: false,
          reason: 'Business unit restriction: You can only access resources in your business unit',
          riskLevel: RiskLevel.MEDIUM,
        };
      }
    }

    return {
      allowed: true,
      recordFilters: filters,
      riskLevel: RiskLevel.LOW,
    };
  }

  /**
   * Check time-based restrictions
   */
  private checkTimeRestrictions(permissions: Permission[]): PolicyDecision {
    const now = new Date();
    const currentDay = now.getDay(); // 0-6
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check if any role has time restrictions
    // For simplicity, checking if current time is within allowed window
    // In production, would check against role.policyRules.timeRestrictions

    return { allowed: true, riskLevel: RiskLevel.LOW };
  }

  /**
   * Check IP whitelist restrictions
   */
  private checkIPRestrictions(permissions: Permission[], ipAddress: string): PolicyDecision {
    // Check if any role requires IP whitelisting
    // For simplicity, allowing all IPs
    // In production, would check against role.policyRules.ipWhitelist

    return { allowed: true, riskLevel: RiskLevel.LOW };
  }

  /**
   * Assess risk level of the action
   */
  private assessRiskLevel(context: PolicyContext, permissions: Permission[]): RiskLevel {
    // High risk actions
    const highRiskActions = [
      'delete',
      'terminate',
      'process_payroll',
      'approve_payroll',
      'export',
      'bulk_update',
    ];

    if (highRiskActions.some(action => context.action.includes(action))) {
      return RiskLevel.HIGH;
    }

    // Financial data access
    if (context.resource.includes('payroll') || context.resource.includes('salary')) {
      return RiskLevel.MEDIUM;
    }

    return RiskLevel.LOW;
  }

  /**
   * Check if MFA is required
   */
  private checkMFARequirement(permissions: Permission[], riskLevel: RiskLevel): boolean {
    // Require MFA for HIGH or CRITICAL risk actions
    return riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL;
  }

  /**
   * Get field masks for the resource
   */
  private getFieldMasks(permissions: Permission[], resource: string): string[] {
    // Extract field masks from role policies
    // For simplicity, returning common sensitive fields
    const sensitiveFields = ['bankAccountNumber', 'taxId', 'ssn', 'medicalInfo'];
    
    // In production, would check role.policyRules.fieldMask
    return [];
  }

  /**
   * Log denied access attempt
   */
  private async logDeniedAccess(context: PolicyContext, reason: string): Promise<void> {
    try {
      await this.auditRepo.save({
        userId: context.userId,
        action: AuditAction.ACCESS_DENIED,
        description: `Access denied: ${reason}`,
        entityType: context.resource,
        entityId: context.resourceId,
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent,
        requestUrl: context.requestUrl,
        success: false,
        errorMessage: reason,
        riskLevel: RiskLevel.MEDIUM,
        flaggedForReview: true,
      });
    } catch (error) {
      this.logger.error(`Failed to log denied access: ${error.message}`);
    }
  }

  /**
   * Log allowed access
   */
  private async logAllowedAccess(context: PolicyContext, riskLevel: RiskLevel): Promise<void> {
    try {
      await this.auditRepo.save({
        userId: context.userId,
        action: this.mapContextActionToAuditAction(context.action, context.resource),
        description: `Accessed ${context.resource} - ${context.action}`,
        entityType: context.resource,
        entityId: context.resourceId,
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent,
        requestUrl: context.requestUrl,
        success: true,
        riskLevel,
        flaggedForReview: riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL,
      });
    } catch (error) {
      this.logger.error(`Failed to log allowed access: ${error.message}`);
    }
  }

  /**
   * Map context action to audit action enum
   */
  private mapContextActionToAuditAction(action: string, resource: string): AuditAction {
    if (action === 'view' && resource === 'employee') return AuditAction.VIEW_EMPLOYEE_PROFILE;
    if (action === 'view' && resource === 'payroll') return AuditAction.VIEW_PAYROLL_DATA;
    if (action === 'create' && resource === 'employee') return AuditAction.CREATE_EMPLOYEE;
    if (action === 'update' && resource === 'employee') return AuditAction.UPDATE_EMPLOYEE;
    if (action === 'delete' && resource === 'employee') return AuditAction.DELETE_EMPLOYEE;
    
    // Default
    return AuditAction.VIEW_EMPLOYEE_PROFILE;
  }
}
