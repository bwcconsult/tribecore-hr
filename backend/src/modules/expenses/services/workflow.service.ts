import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRule, ApprovalRuleType, ApprovalAction } from '../entities/approval-rule.entity';
import { ExpenseClaim } from '../entities/expense-claim.entity';
import { Approval } from '../entities/approval.entity';
import { ApprovalStatus } from '../enums/approval-status.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';

export interface WorkflowResult {
  action: ApprovalAction;
  matchedRule: ApprovalRule | null;
  requiredApprovals: Array<{
    level: number;
    approverRole?: string;
    approverId?: string;
    departmentId?: string;
  }>;
  autoApprove: boolean;
  escalate: boolean;
  escalateTo?: string[];
  notifications?: string[];
}

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(ApprovalRule)
    private approvalRuleRepository: Repository<ApprovalRule>,
    @InjectRepository(ExpenseClaim)
    private claimRepository: Repository<ExpenseClaim>,
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
  ) {}

  /**
   * Evaluate expense claim against approval rules
   */
  async evaluateClaim(claim: ExpenseClaim): Promise<WorkflowResult> {
    // Get all active rules ordered by priority
    const rules = await this.approvalRuleRepository.find({
      where: { isActive: true },
      order: { priority: 'ASC' },
    });

    this.logger.log(`Evaluating claim ${claim.id} against ${rules.length} rules`);

    // Find first matching rule
    for (const rule of rules) {
      if (await this.matchesRule(claim, rule)) {
        this.logger.log(`Claim matched rule: ${rule.name} (${rule.type})`);
        return this.buildWorkflowResult(claim, rule);
      }
    }

    // No matching rule - use default workflow
    this.logger.log('No matching rule - using default workflow');
    return this.buildDefaultWorkflow(claim);
  }

  /**
   * Check if claim matches rule conditions
   */
  private async matchesRule(claim: ExpenseClaim, rule: ApprovalRule): Promise<boolean> {
    const conditions = rule.conditions;

    switch (rule.type) {
      case ApprovalRuleType.AMOUNT_THRESHOLD:
        return this.matchesAmountThreshold(claim, conditions);

      case ApprovalRuleType.CATEGORY:
        return this.matchesCategory(claim, conditions);

      case ApprovalRuleType.DEPARTMENT:
        return this.matchesDepartment(claim, conditions);

      case ApprovalRuleType.EMPLOYEE_LEVEL:
        return this.matchesEmployeeLevel(claim, conditions);

      case ApprovalRuleType.PROJECT:
        return this.matchesProject(claim, conditions);

      case ApprovalRuleType.CUSTOM:
        return this.matchesCustomCondition(claim, conditions);

      default:
        return false;
    }
  }

  /**
   * Match amount threshold conditions
   */
  private matchesAmountThreshold(claim: ExpenseClaim, conditions: any): boolean {
    const amount = Number(claim.totalAmount);

    if (conditions.minAmount !== undefined && amount < conditions.minAmount) {
      return false;
    }

    if (conditions.maxAmount !== undefined && amount > conditions.maxAmount) {
      return false;
    }

    if (conditions.currency && claim.currency !== conditions.currency) {
      return false;
    }

    return true;
  }

  /**
   * Match category conditions
   */
  private matchesCategory(claim: ExpenseClaim, conditions: any): boolean {
    if (!claim.items || claim.items.length === 0) {
      return false;
    }

    const categoryIds = claim.items.map(item => item.categoryId).filter(Boolean);

    if (conditions.categoryIds && conditions.categoryIds.length > 0) {
      return categoryIds.some(id => conditions.categoryIds.includes(id));
    }

    return false;
  }

  /**
   * Match department conditions
   */
  private matchesDepartment(claim: ExpenseClaim, conditions: any): boolean {
    if (!claim.departmentId) {
      return false;
    }

    if (conditions.departmentIds && conditions.departmentIds.length > 0) {
      return conditions.departmentIds.includes(claim.departmentId);
    }

    return false;
  }

  /**
   * Match employee level conditions
   */
  private matchesEmployeeLevel(claim: ExpenseClaim, conditions: any): boolean {
    // This would require employee role/level information
    // For now, return false - implement when employee hierarchy is available
    return false;
  }

  /**
   * Match project conditions
   */
  private matchesProject(claim: ExpenseClaim, conditions: any): boolean {
    if (!claim.projectId) {
      return false;
    }

    if (conditions.projectIds && conditions.projectIds.length > 0) {
      return conditions.projectIds.includes(claim.projectId);
    }

    return false;
  }

  /**
   * Match custom conditions (basic implementation)
   */
  private matchesCustomCondition(claim: ExpenseClaim, conditions: any): boolean {
    // For security, this should be implemented with a safe expression evaluator
    // For now, return false - implement with proper sandboxing
    this.logger.warn('Custom conditions not yet implemented');
    return false;
  }

  /**
   * Build workflow result from matched rule
   */
  private buildWorkflowResult(claim: ExpenseClaim, rule: ApprovalRule): WorkflowResult {
    const config = rule.approvalConfig;

    const result: WorkflowResult = {
      action: rule.action,
      matchedRule: rule,
      requiredApprovals: [],
      autoApprove: config.autoApprove || false,
      escalate: false,
      notifications: config.notificationRecipients || [],
    };

    // Build approval chain based on action
    switch (rule.action) {
      case ApprovalAction.AUTO_APPROVE:
        result.autoApprove = true;
        break;

      case ApprovalAction.REQUIRE_APPROVAL:
        result.requiredApprovals = this.buildApprovalChain(claim, config, 1);
        break;

      case ApprovalAction.REQUIRE_MULTI_LEVEL:
        const levels = config.requiredLevels || 2;
        result.requiredApprovals = this.buildApprovalChain(claim, config, levels);
        break;

      case ApprovalAction.ESCALATE:
        result.escalate = true;
        result.escalateTo = config.escalateTo || [];
        break;

      case ApprovalAction.REJECT:
        // Auto-reject (should be handled by caller)
        break;
    }

    return result;
  }

  /**
   * Build approval chain based on configuration
   */
  private buildApprovalChain(
    claim: ExpenseClaim,
    config: any,
    levels: number,
  ): Array<{
    level: number;
    approverRole?: string;
    approverId?: string;
    departmentId?: string;
  }> {
    const chain = [];

    for (let level = 1; level <= levels; level++) {
      const approval: any = { level };

      // Assign approver based on configuration
      if (config.approverIds && config.approverIds.length > 0) {
        // Specific approvers
        const index = (level - 1) % config.approverIds.length;
        approval.approverId = config.approverIds[index];
      } else if (config.approverRoles && config.approverRoles.length > 0) {
        // Role-based approvers
        const index = (level - 1) % config.approverRoles.length;
        approval.approverRole = config.approverRoles[index];
      } else if (config.approverDepartments && config.approverDepartments.length > 0) {
        // Department-based approvers
        approval.departmentId = claim.departmentId || config.approverDepartments[0];
      } else {
        // Default: assign to manager role
        approval.approverRole = 'MANAGER';
      }

      chain.push(approval);
    }

    return chain;
  }

  /**
   * Build default workflow when no rules match
   */
  private buildDefaultWorkflow(claim: ExpenseClaim): WorkflowResult {
    const amount = Number(claim.totalAmount);

    // Simple default rules based on amount
    if (amount < 100) {
      // Auto-approve small expenses
      return {
        action: ApprovalAction.AUTO_APPROVE,
        matchedRule: null,
        requiredApprovals: [],
        autoApprove: true,
        escalate: false,
      };
    } else if (amount < 1000) {
      // Single level approval
      return {
        action: ApprovalAction.REQUIRE_APPROVAL,
        matchedRule: null,
        requiredApprovals: [{ level: 1, approverRole: 'MANAGER' }],
        autoApprove: false,
        escalate: false,
      };
    } else {
      // Multi-level approval for large expenses
      return {
        action: ApprovalAction.REQUIRE_MULTI_LEVEL,
        matchedRule: null,
        requiredApprovals: [
          { level: 1, approverRole: 'MANAGER' },
          { level: 2, approverRole: 'FINANCE' },
        ],
        autoApprove: false,
        escalate: false,
      };
    }
  }

  /**
   * Create approval records based on workflow result
   */
  async createApprovals(claimId: string, workflow: WorkflowResult): Promise<Approval[]> {
    const approvals: Approval[] = [];

    for (const approvalConfig of workflow.requiredApprovals) {
      const approval = this.approvalRepository.create({
        claimId,
        level: approvalConfig.level,
        status: approvalConfig.level === 1 ? ApprovalStatus.PENDING : ApprovalStatus.PENDING,
        // Note: approverId should be determined by role/hierarchy lookup
        // For now, we'll leave it null and assign when someone claims the approval
      });

      approvals.push(approval);
    }

    if (approvals.length > 0) {
      await this.approvalRepository.save(approvals);
      this.logger.log(`Created ${approvals.length} approval records for claim ${claimId}`);
    }

    return approvals;
  }

  /**
   * Process auto-approval
   */
  async processAutoApproval(claimId: string, workflow: WorkflowResult): Promise<void> {
    const claim = await this.claimRepository.findOne({ where: { id: claimId } });

    if (!claim) {
      throw new Error(`Claim ${claimId} not found`);
    }

    claim.status = ExpenseStatus.APPROVED;
    claim.approvedAt = new Date();

    await this.claimRepository.save(claim);

    this.logger.log(`Auto-approved claim ${claimId} based on rule: ${workflow.matchedRule?.name}`);
  }

  /**
   * Get approval rules summary
   */
  async getRulesSummary(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: { [key: string]: number };
  }> {
    const rules = await this.approvalRuleRepository.find();

    const byType: { [key: string]: number } = {};

    rules.forEach(rule => {
      byType[rule.type] = (byType[rule.type] || 0) + 1;
    });

    return {
      total: rules.length,
      active: rules.filter(r => r.isActive).length,
      inactive: rules.filter(r => !r.isActive).length,
      byType,
    };
  }

  /**
   * Create default approval rules
   */
  async seedDefaultRules(): Promise<ApprovalRule[]> {
    const defaultRules = [
      {
        name: 'Auto-approve small expenses',
        description: 'Automatically approve expenses under £50',
        type: ApprovalRuleType.AMOUNT_THRESHOLD,
        action: ApprovalAction.AUTO_APPROVE,
        priority: 10,
        conditions: { maxAmount: 50, currency: 'GBP' },
        approvalConfig: { autoApprove: true, autoApproveReason: 'Below threshold' },
      },
      {
        name: 'Single approval for medium expenses',
        description: 'Require manager approval for expenses £50-£500',
        type: ApprovalRuleType.AMOUNT_THRESHOLD,
        action: ApprovalAction.REQUIRE_APPROVAL,
        priority: 20,
        conditions: { minAmount: 50, maxAmount: 500, currency: 'GBP' },
        approvalConfig: { requiredLevels: 1, approverRoles: ['MANAGER'] },
      },
      {
        name: 'Multi-level approval for large expenses',
        description: 'Require manager and finance approval for expenses over £500',
        type: ApprovalRuleType.AMOUNT_THRESHOLD,
        action: ApprovalAction.REQUIRE_MULTI_LEVEL,
        priority: 30,
        conditions: { minAmount: 500, currency: 'GBP' },
        approvalConfig: { requiredLevels: 2, approverRoles: ['MANAGER', 'FINANCE'] },
      },
      {
        name: 'Finance approval for travel expenses',
        description: 'All travel expenses require finance approval',
        type: ApprovalRuleType.CATEGORY,
        action: ApprovalAction.REQUIRE_APPROVAL,
        priority: 15,
        conditions: { categoryTypes: ['TRAVEL'] },
        approvalConfig: { requiredLevels: 1, approverRoles: ['FINANCE'] },
      },
    ];

    const createdRules: ApprovalRule[] = [];

    for (const ruleData of defaultRules) {
      const existing = await this.approvalRuleRepository.findOne({
        where: { name: ruleData.name },
      });

      if (!existing) {
        const rule = this.approvalRuleRepository.create(ruleData);
        createdRules.push(await this.approvalRuleRepository.save(rule));
      }
    }

    this.logger.log(`Seeded ${createdRules.length} default approval rules`);
    return createdRules;
  }
}
