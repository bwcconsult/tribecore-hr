import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoleDelegation, DelegationStatus } from '../entities/role-delegation.entity';
import { Role } from '../entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { SoDCheckerService } from './sod-checker.service';
import { AccessAuditLog, AuditAction, RiskLevel } from '../entities/access-audit-log.entity';

export interface CreateDelegationDto {
  delegatorId: string;
  delegateId: string;
  roleId?: string;
  permissionIds?: string[];
  startDate: Date;
  endDate: Date;
  reason: string;
  scopeRestrictions?: any;
  requiresApproval?: boolean;
}

export interface ApproveDelegationDto {
  delegationId: string;
  approverId: string;
  approved: boolean;
  comments?: string;
}

/**
 * Delegation Management Service
 * Handles temporary role/permission delegation for vacation coverage, assistants, etc.
 */
@Injectable()
export class DelegationManagementService {
  private readonly logger = new Logger(DelegationManagementService.name);

  constructor(
    @InjectRepository(RoleDelegation)
    private readonly delegationRepo: Repository<RoleDelegation>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(AccessAuditLog)
    private readonly auditRepo: Repository<AccessAuditLog>,
    private readonly sodChecker: SoDCheckerService,
  ) {}

  /**
   * Create a new delegation request
   */
  async createDelegation(dto: CreateDelegationDto): Promise<RoleDelegation> {
    try {
      // Validate users exist
      const delegator = await this.userRepo.findOne({ where: { id: dto.delegatorId } });
      const delegate = await this.userRepo.findOne({ where: { id: dto.delegateId } });

      if (!delegator || !delegate) {
        throw new NotFoundException('Delegator or delegate not found');
      }

      // Validate dates
      if (dto.startDate >= dto.endDate) {
        throw new BadRequestException('End date must be after start date');
      }

      if (dto.startDate < new Date()) {
        throw new BadRequestException('Start date cannot be in the past');
      }

      // Check if roleId provided and validate
      let role: Role | undefined;
      if (dto.roleId) {
        role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
        if (!role) {
          throw new NotFoundException('Role not found');
        }

        // Check if delegation would create SoD violation
        const sodCheck = await this.sodChecker.checkRoleAssignment(dto.delegateId, dto.roleId);
        if (!sodCheck.allowed) {
          throw new BadRequestException(
            `Delegation would create SoD violation: ${sodCheck.violations.map(v => v.conflictingRoles.map(r => r.roleName).join(', ')).join('; ')}`
          );
        }
      }

      // Determine if approval required
      const requiresApproval = dto.requiresApproval || role?.requiresApproval || false;

      // Create delegation
      const delegation = this.delegationRepo.create({
        delegatorId: dto.delegatorId,
        delegateId: dto.delegateId,
        roleId: dto.roleId,
        permissionIds: dto.permissionIds,
        startDate: dto.startDate,
        endDate: dto.endDate,
        reason: dto.reason,
        scopeRestrictions: dto.scopeRestrictions,
        status: requiresApproval ? DelegationStatus.PENDING : DelegationStatus.ACTIVE,
        autoRevoke: true,
        notifyDelegator: true,
        notifyDelegate: true,
        auditLog: [
          {
            timestamp: new Date(),
            action: 'CREATED',
            actor: dto.delegatorId,
            details: 'Delegation request created',
          },
        ],
      });

      const saved = await this.delegationRepo.save(delegation);

      // Log to audit trail
      await this.logDelegationAction(
        dto.delegatorId,
        AuditAction.DELEGATION_CREATED,
        `Delegated ${role?.name || 'permissions'} to ${delegate.firstName} ${delegate.lastName}`,
        saved.id
      );

      this.logger.log(`Delegation created: ${saved.id} from ${delegator.email} to ${delegate.email}`);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to create delegation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Approve or reject a delegation request
   */
  async approveDelegation(dto: ApproveDelegationDto): Promise<RoleDelegation> {
    try {
      const delegation = await this.delegationRepo.findOne({
        where: { id: dto.delegationId },
        relations: ['delegator', 'delegate', 'role'],
      });

      if (!delegation) {
        throw new NotFoundException('Delegation not found');
      }

      if (delegation.status !== DelegationStatus.PENDING) {
        throw new BadRequestException('Delegation is not pending approval');
      }

      const approver = await this.userRepo.findOne({ where: { id: dto.approverId } });
      if (!approver) {
        throw new NotFoundException('Approver not found');
      }

      if (dto.approved) {
        delegation.status = DelegationStatus.ACTIVE;
        delegation.approvedBy = dto.approverId;
        delegation.approvedAt = new Date();

        // Log approval
        await this.logDelegationAction(
          dto.approverId,
          AuditAction.DELEGATION_APPROVED,
          `Approved delegation from ${delegation.delegator.email} to ${delegation.delegate.email}`,
          delegation.id
        );
      } else {
        delegation.status = DelegationStatus.REVOKED;
        delegation.rejectionReason = dto.comments;

        // Log rejection
        await this.logDelegationAction(
          dto.approverId,
          AuditAction.DELEGATION_REVOKED,
          `Rejected delegation: ${dto.comments}`,
          delegation.id
        );
      }

      // Update audit log
      delegation.auditLog = [
        ...(delegation.auditLog || []),
        {
          timestamp: new Date(),
          action: dto.approved ? 'APPROVED' : 'REJECTED',
          actor: dto.approverId,
          details: dto.comments || (dto.approved ? 'Approved' : 'Rejected'),
        },
      ];

      const updated = await this.delegationRepo.save(delegation);

      this.logger.log(`Delegation ${dto.approved ? 'approved' : 'rejected'}: ${delegation.id}`);

      return updated;
    } catch (error) {
      this.logger.error(`Failed to approve delegation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Revoke an active delegation
   */
  async revokeDelegation(delegationId: string, revokedBy: string, reason: string): Promise<RoleDelegation> {
    try {
      const delegation = await this.delegationRepo.findOne({
        where: { id: delegationId },
        relations: ['delegator', 'delegate'],
      });

      if (!delegation) {
        throw new NotFoundException('Delegation not found');
      }

      if (delegation.status !== DelegationStatus.ACTIVE) {
        throw new BadRequestException('Delegation is not active');
      }

      delegation.status = DelegationStatus.REVOKED;
      delegation.revokedBy = revokedBy;
      delegation.revokedAt = new Date();
      delegation.revocationReason = reason;

      // Update audit log
      delegation.auditLog = [
        ...(delegation.auditLog || []),
        {
          timestamp: new Date(),
          action: 'REVOKED',
          actor: revokedBy,
          details: reason,
        },
      ];

      const updated = await this.delegationRepo.save(delegation);

      // Log to audit trail
      await this.logDelegationAction(
        revokedBy,
        AuditAction.DELEGATION_REVOKED,
        `Revoked delegation: ${reason}`,
        delegation.id
      );

      this.logger.log(`Delegation revoked: ${delegationId} by ${revokedBy}`);

      return updated;
    } catch (error) {
      this.logger.error(`Failed to revoke delegation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get active delegations for a user
   */
  async getUserDelegations(userId: string): Promise<{
    delegatedTo: RoleDelegation[];
    delegatedFrom: RoleDelegation[];
  }> {
    const now = new Date();

    const delegatedTo = await this.delegationRepo.find({
      where: {
        delegateId: userId,
        status: DelegationStatus.ACTIVE,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      relations: ['delegator', 'role'],
    });

    const delegatedFrom = await this.delegationRepo.find({
      where: {
        delegatorId: userId,
        status: DelegationStatus.ACTIVE,
      },
      relations: ['delegate', 'role'],
    });

    return { delegatedTo, delegatedFrom };
  }

  /**
   * Get pending delegations requiring approval
   */
  async getPendingApprovals(approverId: string): Promise<RoleDelegation[]> {
    return this.delegationRepo.find({
      where: { status: DelegationStatus.PENDING },
      relations: ['delegator', 'delegate', 'role'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Cron job to auto-expire delegations
   */
  @Cron('0 */6 * * *') // Every 6 hours
  async autoExpireDelegations(): Promise<void> {
    try {
      const now = new Date();

      const expiredDelegations = await this.delegationRepo.find({
        where: {
          status: DelegationStatus.ACTIVE,
          endDate: LessThan(now),
          autoRevoke: true,
        },
      });

      for (const delegation of expiredDelegations) {
        delegation.status = DelegationStatus.EXPIRED;
        delegation.revokedBy = 'SYSTEM';
        delegation.revokedAt = now;
        delegation.revocationReason = 'Auto-expired after end date';

        delegation.auditLog = [
          ...(delegation.auditLog || []),
          {
            timestamp: now,
            action: 'AUTO_EXPIRED',
            actor: 'SYSTEM',
            details: 'Delegation auto-expired',
          },
        ];

        await this.delegationRepo.save(delegation);
      }

      if (expiredDelegations.length > 0) {
        this.logger.log(`Auto-expired ${expiredDelegations.length} delegations`);
      }
    } catch (error) {
      this.logger.error(`Auto-expire delegations failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Cron job to send reminder for expiring delegations
   */
  @Cron('0 9 * * *') // Daily at 9 AM
  async sendExpirationReminders(): Promise<void> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const expiringDelegations = await this.delegationRepo.find({
        where: {
          status: DelegationStatus.ACTIVE,
          endDate: LessThan(tomorrow),
          notifyDelegator: true,
        },
        relations: ['delegator', 'delegate'],
      });

      for (const delegation of expiringDelegations) {
        // Send notification (to be implemented)
        delegation.remindersSent += 1;
        await this.delegationRepo.save(delegation);
      }

      if (expiringDelegations.length > 0) {
        this.logger.log(`Sent expiration reminders for ${expiringDelegations.length} delegations`);
      }
    } catch (error) {
      this.logger.error(`Send expiration reminders failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Get delegation statistics
   */
  async getDelegationStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    expired: number;
    revoked: number;
  }> {
    const [total, active, pending, expired, revoked] = await Promise.all([
      this.delegationRepo.count(),
      this.delegationRepo.count({ where: { status: DelegationStatus.ACTIVE } }),
      this.delegationRepo.count({ where: { status: DelegationStatus.PENDING } }),
      this.delegationRepo.count({ where: { status: DelegationStatus.EXPIRED } }),
      this.delegationRepo.count({ where: { status: DelegationStatus.REVOKED } }),
    ]);

    return { total, active, pending, expired, revoked };
  }

  /**
   * Log delegation action to audit trail
   */
  private async logDelegationAction(
    userId: string,
    action: AuditAction,
    description: string,
    delegationId: string
  ): Promise<void> {
    try {
      await this.auditRepo.save({
        userId,
        action,
        description,
        entityType: 'RoleDelegation',
        entityId: delegationId,
        success: true,
        riskLevel: RiskLevel.MEDIUM,
        ipAddress: 'system',
      });
    } catch (error) {
      this.logger.error(`Failed to log delegation action: ${error.message}`);
    }
  }
}
