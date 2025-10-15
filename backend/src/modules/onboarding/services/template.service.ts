import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingTemplate } from '../entities/onboarding-template.entity';
import { ChecklistItem } from '../entities/checklist-item.entity';
import { OnboardCase } from '../entities/onboard-case.entity';
import { OnboardingTask } from '../entities/onboarding-task.entity';
import { CreateOnboardingTemplateDto } from '../dto/create-onboarding-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(OnboardingTemplate)
    private readonly templateRepository: Repository<OnboardingTemplate>,
    @InjectRepository(ChecklistItem)
    private readonly checklistItemRepository: Repository<ChecklistItem>,
    @InjectRepository(OnboardCase)
    private readonly caseRepository: Repository<OnboardCase>,
    @InjectRepository(OnboardingTask)
    private readonly taskRepository: Repository<OnboardingTask>,
  ) {}

  /**
   * Create a new onboarding template
   */
  async createTemplate(dto: CreateOnboardingTemplateDto): Promise<OnboardingTemplate> {
    const template = this.templateRepository.create({
      organizationId: dto.organizationId,
      name: dto.name,
      description: dto.description,
      country: dto.country,
      entityId: dto.entityId,
      version: dto.version || 1,
      tags: dto.tags || [],
      active: dto.active !== undefined ? dto.active : true,
      metadata: dto.metadata,
    });

    const savedTemplate = await this.templateRepository.save(template);

    // Create checklist items
    if (dto.checklistItems && dto.checklistItems.length > 0) {
      const items = dto.checklistItems.map((item, index) =>
        this.checklistItemRepository.create({
          templateId: savedTemplate.id,
          name: item.name,
          description: item.description,
          ownerRole: item.ownerRole,
          durationDays: item.durationDays,
          required: item.required !== undefined ? item.required : true,
          dependencies: item.dependencies || [],
          slaHours: item.slaHours,
          orderIndex: item.orderIndex !== undefined ? item.orderIndex : index,
          metadata: item.metadata,
        }),
      );

      await this.checklistItemRepository.save(items);
    }

    return this.getTemplate(savedTemplate.id);
  }

  /**
   * Get template by ID with checklist items
   */
  async getTemplate(id: string): Promise<OnboardingTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['checklistItems'],
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * Get all templates with filters
   */
  async getTemplates(filters: {
    organizationId: string;
    country?: string;
    active?: boolean;
    tags?: string[];
  }): Promise<OnboardingTemplate[]> {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.checklistItems', 'items')
      .where('template.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      })
      .orderBy('items.orderIndex', 'ASC');

    if (filters.country) {
      query.andWhere('template.country = :country', { country: filters.country });
    }

    if (filters.active !== undefined) {
      query.andWhere('template.active = :active', { active: filters.active });
    }

    if (filters.tags && filters.tags.length > 0) {
      query.andWhere('template.tags && :tags', { tags: filters.tags });
    }

    return query.getMany();
  }

  /**
   * Generate an OnboardingCase from a template
   * This is the core business logic that creates tasks based on template checklist items
   */
  async generateCaseFromTemplate(
    templateId: string,
    employeeId: string,
    startDate: Date,
    additionalData?: {
      candidateId?: string;
      organizationId?: string;
      country?: string;
      site?: string;
      department?: string;
      jobTitle?: string;
      hiringManagerId?: string;
      buddyId?: string;
      mentorId?: string;
      metadata?: any;
    },
  ): Promise<OnboardCase> {
    // Load template with checklist items
    const template = await this.getTemplate(templateId);

    if (!template.active) {
      throw new BadRequestException('Cannot create case from inactive template');
    }

    // Create the onboarding case
    const onboardCase = this.caseRepository.create({
      employeeId,
      candidateId: additionalData?.candidateId,
      organizationId: additionalData?.organizationId || template.organizationId,
      country: additionalData?.country || template.country,
      site: additionalData?.site,
      department: additionalData?.department,
      jobTitle: additionalData?.jobTitle || 'New Hire',
      startDate,
      status: 'OFFER_SIGNED' as any,
      hiringManagerId: additionalData?.hiringManagerId,
      buddyId: additionalData?.buddyId,
      mentorId: additionalData?.mentorId,
      metadata: additionalData?.metadata,
    });

    const savedCase = await this.caseRepository.save(onboardCase);

    // Generate tasks from checklist items
    const tasks = template.checklistItems.map((item) => {
      // Calculate due date based on durationDays offset from start date
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + item.durationDays);

      return this.taskRepository.create({
        organizationId: savedCase.organizationId,
        caseId: savedCase.id,
        type: item.metadata?.category || 'GENERAL',
        title: item.name,
        description: item.description,
        assigneeRole: item.ownerRole, // Map ownerRole to assigneeRole
        dueDate,
        status: 'PENDING' as any,
        dependencies: item.dependencies || [],
        slaHours: item.slaHours,
        metadata: {
          required: item.required,
          templateItemId: item.id,
          ...item.metadata,
        },
      });
    });

    // Save all tasks
    if (tasks.length > 0) {
      await this.taskRepository.save(tasks);
    }

    // Return case with tasks
    return this.caseRepository.findOne({
      where: { id: savedCase.id },
      relations: ['employee'],
    });
  }

  /**
   * Update template
   */
  async updateTemplate(
    id: string,
    updates: Partial<CreateOnboardingTemplateDto>,
  ): Promise<OnboardingTemplate> {
    const template = await this.getTemplate(id);

    Object.assign(template, {
      name: updates.name,
      description: updates.description,
      country: updates.country,
      entityId: updates.entityId,
      tags: updates.tags,
      active: updates.active,
      metadata: updates.metadata,
    });

    await this.templateRepository.save(template);

    // Handle checklist items update if provided
    if (updates.checklistItems) {
      // Delete existing items
      await this.checklistItemRepository.delete({ templateId: id });

      // Create new items
      const items = updates.checklistItems.map((item, index) =>
        this.checklistItemRepository.create({
          templateId: id,
          name: item.name,
          description: item.description,
          ownerRole: item.ownerRole,
          durationDays: item.durationDays,
          required: item.required !== undefined ? item.required : true,
          dependencies: item.dependencies || [],
          slaHours: item.slaHours,
          orderIndex: item.orderIndex !== undefined ? item.orderIndex : index,
          metadata: item.metadata,
        }),
      );

      await this.checklistItemRepository.save(items);
    }

    return this.getTemplate(id);
  }

  /**
   * Delete template (soft delete)
   */
  async deleteTemplate(id: string): Promise<void> {
    const template = await this.getTemplate(id);
    await this.templateRepository.softRemove(template);
  }

  /**
   * Clone template (create a new version)
   */
  async cloneTemplate(id: string, newName?: string): Promise<OnboardingTemplate> {
    const original = await this.getTemplate(id);

    const dto: CreateOnboardingTemplateDto = {
      organizationId: original.organizationId,
      name: newName || `${original.name} (Copy)`,
      description: original.description,
      country: original.country,
      entityId: original.entityId,
      version: original.version + 1,
      tags: original.tags,
      active: false, // New clones are inactive by default
      checklistItems: original.checklistItems.map((item) => ({
        name: item.name,
        description: item.description,
        ownerRole: item.ownerRole,
        durationDays: item.durationDays,
        required: item.required,
        dependencies: item.dependencies,
        slaHours: item.slaHours,
        orderIndex: item.orderIndex,
        metadata: item.metadata,
      })),
      metadata: original.metadata,
    };

    return this.createTemplate(dto);
  }
}
