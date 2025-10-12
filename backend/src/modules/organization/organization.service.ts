import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(createDto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepository.create(createDto);
    return this.organizationRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find();
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({ where: { id } });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async update(id: string, updateDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id);
    Object.assign(organization, updateDto);
    return this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.organizationRepository.softDelete(id);
  }

  async updateSettings(id: string, settings: any): Promise<Organization> {
    const organization = await this.findOne(id);
    organization.settings = {
      ...organization.settings,
      ...settings,
    };
    return this.organizationRepository.save(organization);
  }

  async getSettings(id: string): Promise<any> {
    const organization = await this.findOne(id);
    return organization.settings || {};
  }

  // Helper methods for specific settings
  async getEmployeeIdPrefix(id: string): Promise<string> {
    const settings = await this.getSettings(id);
    return settings.employeeIdPrefix || 'EMP-';
  }

  async getWorkLocations(id: string): Promise<string[]> {
    const settings = await this.getSettings(id);
    return settings.workLocations || ['Office', 'Remote', 'Hybrid'];
  }

  async getDepartments(id: string): Promise<string[]> {
    const settings = await this.getSettings(id);
    return settings.departments || ['Engineering', 'Sales', 'HR', 'Finance', 'Operations'];
  }

  async getJobLevels(id: string): Promise<string[]> {
    const settings = await this.getSettings(id);
    return settings.jobLevels || ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'VP', 'C-Level'];
  }

  async getOnboardingChecklist(id: string): Promise<any[]> {
    const settings = await this.getSettings(id);
    return settings.onboardingChecklist || [
      {
        id: '1',
        title: 'Complete personal information',
        description: 'Fill in all required personal details',
        category: 'Documentation',
        daysToComplete: 1,
        isRequired: true,
        order: 1,
      },
      {
        id: '2',
        title: 'Sign employment contract',
        description: 'Review and sign your employment contract',
        category: 'Legal',
        daysToComplete: 3,
        isRequired: true,
        order: 2,
      },
      {
        id: '3',
        title: 'Set up workstation',
        description: 'Configure your laptop and tools',
        category: 'IT',
        daysToComplete: 5,
        isRequired: true,
        order: 3,
      },
      {
        id: '4',
        title: 'Complete compliance training',
        description: 'Finish all mandatory compliance courses',
        category: 'Training',
        daysToComplete: 7,
        isRequired: true,
        order: 4,
      },
    ];
  }
}
