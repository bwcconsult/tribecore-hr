import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRule, ApprovalRuleType, ApprovalAction } from '../entities/approval-rule.entity';
import { WorkflowService } from '../services/workflow.service';

class CreateApprovalRuleDto {
  name: string;
  description?: string;
  type: ApprovalRuleType;
  action: ApprovalAction;
  priority: number;
  conditions: any;
  approvalConfig: any;
}

@ApiTags('Approval Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses/workflows')
export class WorkflowController {
  constructor(
    @InjectRepository(ApprovalRule)
    private approvalRuleRepository: Repository<ApprovalRule>,
    private workflowService: WorkflowService,
  ) {}

  @Post('rules')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Create approval rule' })
  @ApiResponse({ status: 201, description: 'Rule created' })
  async createRule(@Body() createDto: CreateApprovalRuleDto, @CurrentUser() user: any) {
    const rule = this.approvalRuleRepository.create({
      ...createDto,
      createdBy: user.id,
    });

    return this.approvalRuleRepository.save(rule);
  }

  @Get('rules')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all approval rules' })
  @ApiResponse({ status: 200, description: 'List of rules' })
  async getAllRules() {
    return this.approvalRuleRepository.find({
      order: { priority: 'ASC' },
    });
  }

  @Get('rules/:id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get approval rule by ID' })
  @ApiResponse({ status: 200, description: 'Rule details' })
  async getRule(@Param('id') id: string) {
    return this.approvalRuleRepository.findOne({ where: { id } });
  }

  @Put('rules/:id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Update approval rule' })
  @ApiResponse({ status: 200, description: 'Rule updated' })
  async updateRule(@Param('id') id: string, @Body() updateDto: Partial<CreateApprovalRuleDto>) {
    await this.approvalRuleRepository.update(id, updateDto);
    return this.approvalRuleRepository.findOne({ where: { id } });
  }

  @Delete('rules/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete approval rule' })
  @ApiResponse({ status: 204, description: 'Rule deleted' })
  async deleteRule(@Param('id') id: string) {
    await this.approvalRuleRepository.delete(id);
  }

  @Put('rules/:id/activate')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Activate approval rule' })
  @ApiResponse({ status: 200, description: 'Rule activated' })
  async activateRule(@Param('id') id: string) {
    await this.approvalRuleRepository.update(id, { isActive: true });
    return this.approvalRuleRepository.findOne({ where: { id } });
  }

  @Put('rules/:id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Deactivate approval rule' })
  @ApiResponse({ status: 200, description: 'Rule deactivated' })
  async deactivateRule(@Param('id') id: string) {
    await this.approvalRuleRepository.update(id, { isActive: false });
    return this.approvalRuleRepository.findOne({ where: { id } });
  }

  @Put('rules/reorder')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Reorder approval rules by priority' })
  @ApiResponse({ status: 200, description: 'Rules reordered' })
  async reorderRules(@Body() body: { ruleIds: string[] }) {
    const { ruleIds } = body;

    for (let i = 0; i < ruleIds.length; i++) {
      await this.approvalRuleRepository.update(ruleIds[i], { priority: (i + 1) * 10 });
    }

    return { message: 'Rules reordered successfully', count: ruleIds.length };
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get workflow rules summary' })
  @ApiResponse({ status: 200, description: 'Rules summary' })
  async getRulesSummary() {
    return this.workflowService.getRulesSummary();
  }

  @Post('seed')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Seed default approval rules' })
  @ApiResponse({ status: 201, description: 'Default rules created' })
  async seedDefaultRules() {
    const rules = await this.workflowService.seedDefaultRules();

    return {
      message: 'Default approval rules seeded successfully',
      count: rules.length,
      rules,
    };
  }

  @Get('rule-types')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get available rule types and actions' })
  @ApiResponse({ status: 200, description: 'Rule types and actions' })
  async getRuleTypes() {
    return {
      types: Object.values(ApprovalRuleType),
      actions: Object.values(ApprovalAction),
      typeDescriptions: {
        AMOUNT_THRESHOLD: 'Rules based on expense amount',
        CATEGORY: 'Rules based on expense category',
        DEPARTMENT: 'Rules based on department',
        EMPLOYEE_LEVEL: 'Rules based on employee level/role',
        PROJECT: 'Rules based on project',
        CUSTOM: 'Custom conditional rules',
      },
      actionDescriptions: {
        AUTO_APPROVE: 'Automatically approve the expense',
        REQUIRE_APPROVAL: 'Require single level approval',
        REQUIRE_MULTI_LEVEL: 'Require multiple approval levels',
        ESCALATE: 'Escalate to higher authority',
        REJECT: 'Automatically reject the expense',
      },
    };
  }

  @Post('test/:claimId')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Test workflow rules against a claim' })
  @ApiResponse({ status: 200, description: 'Workflow evaluation result' })
  async testWorkflow(@Param('claimId') claimId: string) {
    const { ExpenseClaim } = await import('../entities/expense-claim.entity');
    const claimRepo = this.approvalRuleRepository.manager.getRepository(ExpenseClaim);
    
    const claim = await claimRepo.findOne({
      where: { id: claimId },
      relations: ['items', 'items.category'],
    });

    if (!claim) {
      return { error: 'Claim not found' };
    }

    const workflow = await this.workflowService.evaluateClaim(claim);

    return {
      claimId: claim.id,
      claimAmount: claim.totalAmount,
      claimCurrency: claim.currency,
      workflowResult: workflow,
      message: 'Workflow evaluation complete',
    };
  }
}
