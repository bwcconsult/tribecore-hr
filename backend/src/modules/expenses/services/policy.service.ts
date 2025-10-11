import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyRule } from '../entities/policy-rule.entity';
import { ExpenseClaim } from '../entities/expense-claim.entity';
import { CreatePolicyRuleDto } from '../dto/create-policy-rule.dto';
import { PolicyRuleType } from '../enums/expense-types.enum';

interface PolicyViolation {
  rule: string;
  message: string;
  severity: 'warning' | 'error';
  ruleId: string;
}

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(PolicyRule)
    private policyRepository: Repository<PolicyRule>,
  ) {}

  async create(createDto: CreatePolicyRuleDto): Promise<PolicyRule> {
    const policy = this.policyRepository.create(createDto);
    return this.policyRepository.save(policy);
  }

  async findAll(): Promise<PolicyRule[]> {
    return this.policyRepository.find({
      where: { isActive: true },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PolicyRule> {
    return this.policyRepository.findOneOrFail({ where: { id } });
  }

  async update(id: string, updateDto: Partial<CreatePolicyRuleDto>): Promise<PolicyRule> {
    await this.policyRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.policyRepository.delete(id);
  }

  async validateClaim(claim: ExpenseClaim): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];

    // Get applicable policy rules
    const policies = await this.getApplicablePolicies(claim);

    for (const policy of policies) {
      const violation = await this.checkPolicy(claim, policy);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  private async getApplicablePolicies(claim: ExpenseClaim): Promise<PolicyRule[]> {
    const query = this.policyRepository
      .createQueryBuilder('policy')
      .where('policy.isActive = :isActive', { isActive: true })
      .andWhere(
        '(policy.scope = :global OR ' +
          '(policy.scope = :department AND policy.departmentId = :departmentId) OR ' +
          '(policy.scope = :project AND policy.projectId = :projectId) OR ' +
          '(policy.scope = :individual AND policy.userId = :userId))',
        {
          global: 'GLOBAL',
          department: 'DEPARTMENT',
          departmentId: claim.departmentId,
          project: 'PROJECT',
          projectId: claim.projectId,
          individual: 'INDIVIDUAL',
          userId: claim.employeeId,
        },
      )
      .orderBy('policy.priority', 'DESC');

    return query.getMany();
  }

  private async checkPolicy(claim: ExpenseClaim, policy: PolicyRule): Promise<PolicyViolation | null> {
    switch (policy.ruleType) {
      case PolicyRuleType.MAX_AMOUNT:
        return this.checkMaxAmount(claim, policy);

      case PolicyRuleType.REQUIRES_RECEIPT:
        return this.checkReceiptRequirement(claim, policy);

      case PolicyRuleType.RECEIPT_THRESHOLD:
        return this.checkReceiptThreshold(claim, policy);

      case PolicyRuleType.DAILY_LIMIT:
      case PolicyRuleType.MONTHLY_LIMIT:
        // These would require additional date-based queries
        return null;

      default:
        return null;
    }
  }

  private checkMaxAmount(claim: ExpenseClaim, policy: PolicyRule): PolicyViolation | null {
    if (policy.threshold && claim.totalAmount > policy.threshold) {
      return {
        rule: policy.name,
        message: `Claim amount ${claim.totalAmount} ${claim.currency} exceeds maximum allowed ${policy.threshold} ${policy.currency}`,
        severity: 'error',
        ruleId: policy.id,
      };
    }
    return null;
  }

  private checkReceiptRequirement(claim: ExpenseClaim, policy: PolicyRule): PolicyViolation | null {
    if (policy.requiresReceipt) {
      const itemsWithoutReceipts = claim.items?.filter(
        item => item.receiptRequired && !item.receiptAttached,
      );

      if (itemsWithoutReceipts && itemsWithoutReceipts.length > 0) {
        return {
          rule: policy.name,
          message: `${itemsWithoutReceipts.length} item(s) missing required receipts`,
          severity: 'error',
          ruleId: policy.id,
        };
      }
    }
    return null;
  }

  private checkReceiptThreshold(claim: ExpenseClaim, policy: PolicyRule): PolicyViolation | null {
    if (policy.receiptThreshold) {
      const itemsAboveThreshold = claim.items?.filter(
        item => item.amount > (policy.receiptThreshold || 0) && !item.receiptAttached,
      );

      if (itemsAboveThreshold && itemsAboveThreshold.length > 0) {
        return {
          rule: policy.name,
          message: `${itemsAboveThreshold.length} item(s) above ${policy.receiptThreshold} ${policy.currency} require receipts`,
          severity: 'warning',
          ruleId: policy.id,
        };
      }
    }
    return null;
  }

  async getApprovalLevels(claim: ExpenseClaim): Promise<any[]> {
    const policies = await this.getApplicablePolicies(claim);

    // Find policies that define approval levels
    for (const policy of policies) {
      if (policy.approvalLevels && policy.approvalLevels.length > 0) {
        // Filter levels based on claim amount
        return policy.approvalLevels.filter(level => {
          if (level.minAmount && claim.totalAmount < level.minAmount) return false;
          if (level.maxAmount && claim.totalAmount > level.maxAmount) return false;
          return true;
        });
      }
    }

    // Default: single level approval
    return [{ level: 1, role: 'MANAGER' }];
  }
}
