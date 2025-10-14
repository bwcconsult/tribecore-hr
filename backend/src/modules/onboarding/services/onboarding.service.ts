import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardCase, OnboardingStatus } from '../entities/onboard-case.entity';
import { OnboardChecklist, ChecklistStatus } from '../entities/onboard-checklist.entity';
import { Provision, ProvisionType } from '../entities/provision.entity';

/**
 * OnboardingService
 * Manages new hire onboarding from offer to day 90
 */
@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardCase)
    private caseRepo: Repository<OnboardCase>,
    @InjectRepository(OnboardChecklist)
    private checklistRepo: Repository<OnboardChecklist>,
    @InjectRepository(Provision)
    private provisionRepo: Repository<Provision>,
  ) {}

  /**
   * Create onboarding case from accepted offer
   */
  async createFromOffer(data: {
    candidateId: string;
    organizationId: string;
    country: string;
    site: string;
    department: string;
    jobTitle: string;
    startDate: Date;
    hiringManagerId: string;
    roleBlueprintId?: string;
    metadata?: any;
  }): Promise<OnboardCase> {
    const onboardCase = this.caseRepo.create({
      ...data,
      status: OnboardingStatus.OFFER_SIGNED,
    });

    // Calculate probation end date (default 90 days)
    const probationEnd = new Date(data.startDate);
    probationEnd.setDate(probationEnd.getDate() + onboardCase.probationPeriodDays);
    onboardCase.probationEndDate = probationEnd;

    await this.caseRepo.save(onboardCase);

    // Generate checklists from blueprint
    await this.generateChecklists(onboardCase);

    // Request standard provisions
    await this.requestStandardProvisions(onboardCase);

    return onboardCase;
  }

  /**
   * Generate standard checklists
   */
  private async generateChecklists(onboardCase: OnboardCase): Promise<void> {
    const startDate = new Date(onboardCase.startDate);

    const checklistTemplates = [
      {
        name: 'HR Pre-boarding',
        category: 'HR',
        daysBeforeStart: -14,
        tasks: [
          { title: 'Send welcome email', order: 1 },
          { title: 'Collect personal details', order: 2 },
          { title: 'Send contracts for signature', order: 3 },
          { title: 'Verify right to work', order: 4 },
          { title: 'Initiate background check', order: 5 },
        ],
      },
      {
        name: 'IT Provisioning',
        category: 'IT',
        daysBeforeStart: -7,
        tasks: [
          { title: 'Create email account', order: 1 },
          { title: 'Set up workstation', order: 2 },
          { title: 'Assign software licenses', order: 3 },
          { title: 'Configure phone/mobile', order: 4 },
        ],
      },
      {
        name: 'Day 1 Checklist',
        category: 'MANAGER',
        daysBeforeStart: 0,
        tasks: [
          { title: 'Welcome meeting', order: 1 },
          { title: 'Office tour', order: 2 },
          { title: 'Team introductions', order: 3 },
          { title: 'Review first week plan', order: 4 },
        ],
      },
      {
        name: 'First Week',
        category: 'HR',
        daysBeforeStart: 7,
        tasks: [
          { title: 'Benefits enrollment', order: 1 },
          { title: 'Payroll setup', order: 2 },
          { title: 'Policy acknowledgments', order: 3 },
          { title: 'Health & Safety training', order: 4 },
        ],
      },
    ];

    for (const template of checklistTemplates) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + template.daysBeforeStart);

      const tasks = template.tasks.map(t => ({
        id: `TASK_${Math.random().toString(36).substr(2, 9)}`,
        title: t.title,
        completed: false,
        order: t.order,
      }));

      await this.checklistRepo.save(
        this.checklistRepo.create({
          caseId: onboardCase.id,
          organizationId: onboardCase.organizationId,
          name: template.name,
          category: template.category,
          dueDate,
          tasks,
          totalTasks: tasks.length,
          completedTasks: 0,
        }),
      );
    }
  }

  /**
   * Request standard provisions
   */
  private async requestStandardProvisions(onboardCase: OnboardCase): Promise<void> {
    const startDate = new Date(onboardCase.startDate);
    const requiredBy = new Date(startDate);
    requiredBy.setDate(requiredBy.getDate() - 2); // 2 days before start

    const provisions = [
      {
        type: ProvisionType.ACCOUNT,
        item: 'Email Account',
        assigneeTeam: 'IT',
      },
      {
        type: ProvisionType.EQUIPMENT,
        item: 'Laptop',
        assigneeTeam: 'IT',
      },
      {
        type: ProvisionType.EQUIPMENT,
        item: 'Mobile Phone',
        assigneeTeam: 'IT',
      },
      {
        type: ProvisionType.ACCESS_BADGE,
        item: 'Building Access Badge',
        assigneeTeam: 'SECURITY',
      },
      {
        type: ProvisionType.SEATING,
        item: 'Desk Assignment',
        assigneeTeam: 'FACILITIES',
      },
    ];

    for (const provision of provisions) {
      await this.provisionRepo.save(
        this.provisionRepo.create({
          caseId: onboardCase.id,
          organizationId: onboardCase.organizationId,
          ...provision,
          requiredBy,
        }),
      );
    }
  }

  /**
   * Complete checklist task
   */
  async completeTask(
    checklistId: string,
    taskId: string,
    completedBy: string,
  ): Promise<OnboardChecklist> {
    const checklist = await this.checklistRepo.findOne({ where: { id: checklistId } });
    if (!checklist) throw new NotFoundException('Checklist not found');

    const task = checklist.tasks.find(t => t.id === taskId);
    if (!task) throw new NotFoundException('Task not found');

    task.completed = true;
    task.completedAt = new Date();
    task.completedBy = completedBy;

    checklist.completedTasks = checklist.tasks.filter(t => t.completed).length;

    if (checklist.completedTasks === checklist.totalTasks) {
      checklist.status = ChecklistStatus.COMPLETED;
    } else if (checklist.completedTasks > 0) {
      checklist.status = ChecklistStatus.IN_PROGRESS;
    }

    return this.checklistRepo.save(checklist);
  }

  /**
   * Update provision status
   */
  async updateProvision(
    provisionId: string,
    status: string,
    completedBy?: string,
  ): Promise<Provision> {
    const provision = await this.provisionRepo.findOne({ where: { id: provisionId } });
    if (!provision) throw new NotFoundException('Provision not found');

    provision.status = status as any;

    if (status === 'DELIVERED') {
      provision.completedAt = new Date();
      provision.completedBy = completedBy;
    }

    await this.provisionRepo.save(provision);

    // Check if all provisions complete
    await this.checkProvisioningComplete(provision.caseId);

    return provision;
  }

  /**
   * Check if all provisions ready
   */
  private async checkProvisioningComplete(caseId: string): Promise<void> {
    const provisions = await this.provisionRepo.find({ where: { caseId } });
    const allComplete = provisions.every(p => p.status === 'DELIVERED');

    if (allComplete) {
      const onboardCase = await this.caseRepo.findOne({ where: { id: caseId } });
      if (onboardCase) {
        onboardCase.provisioningComplete = true;
        onboardCase.provisioningCompletedAt = new Date();
        await this.caseRepo.save(onboardCase);
      }
    }
  }

  /**
   * Get case with all details
   */
  async getCaseDetails(caseId: string): Promise<any> {
    const onboardCase = await this.caseRepo.findOne({
      where: { id: caseId },
      relations: ['employee'],
    });

    if (!onboardCase) throw new NotFoundException('Case not found');

    const checklists = await this.checklistRepo.find({ where: { caseId } });
    const provisions = await this.provisionRepo.find({ where: { caseId } });

    return {
      case: onboardCase,
      checklists,
      provisions,
      readinessScore: onboardCase.getCompletionPercentage(),
      isReadyForDay1: onboardCase.isReadyForDay1(),
      daysUntilStart: onboardCase.getDaysUntilStart(),
    };
  }

  /**
   * Mark pre-boarding complete
   */
  async completePreBoarding(caseId: string): Promise<OnboardCase> {
    const onboardCase = await this.caseRepo.findOne({ where: { id: caseId } });
    if (!onboardCase) throw new NotFoundException('Case not found');

    onboardCase.preBoardingCompletedAt = new Date();
    onboardCase.status = OnboardingStatus.PRE_BOARDING;

    return this.caseRepo.save(onboardCase);
  }

  /**
   * Record probation review decision
   */
  async recordProbationDecision(
    caseId: string,
    decision: 'PASS' | 'EXTEND' | 'FAIL',
    notes?: string,
  ): Promise<OnboardCase> {
    const onboardCase = await this.caseRepo.findOne({ where: { id: caseId } });
    if (!onboardCase) throw new NotFoundException('Case not found');

    if (decision === 'PASS') {
      onboardCase.status = OnboardingStatus.COMPLETED;
    } else if (decision === 'EXTEND') {
      const newEnd = new Date(onboardCase.probationEndDate);
      newEnd.setDate(newEnd.getDate() + 30); // Extend by 30 days
      onboardCase.probationEndDate = newEnd;
    }

    if (!onboardCase.metadata) onboardCase.metadata = {};
    onboardCase.metadata.probationDecision = {
      decision,
      decidedAt: new Date(),
      notes,
    };

    return this.caseRepo.save(onboardCase);
  }
}
