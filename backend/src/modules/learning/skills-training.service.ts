import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Skill, PersonSkill } from './entities/skill.entity';
import {
  EducationHistory,
  ProfessionalQualification,
  Language,
  License,
} from './entities/qualification.entity';
import {
  TrainingActivity,
  DevelopmentPlan,
  DevelopmentNeed,
} from './entities/training-activity.entity';
import {
  CreateSkillDto,
  CreatePersonSkillDto,
  CreateEducationDto,
  CreateQualificationDto,
  CreateLanguageDto,
  CreateLicenseDto,
  CreateTrainingActivityDto,
  UpdateTrainingActivityDto,
  CreateDevelopmentPlanDto,
  CreateDevelopmentNeedDto,
} from './dto/skills-training.dto';

@Injectable()
export class SkillsTrainingService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @InjectRepository(PersonSkill)
    private readonly personSkillRepository: Repository<PersonSkill>,
    @InjectRepository(EducationHistory)
    private readonly educationRepository: Repository<EducationHistory>,
    @InjectRepository(ProfessionalQualification)
    private readonly qualificationRepository: Repository<ProfessionalQualification>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(TrainingActivity)
    private readonly trainingRepository: Repository<TrainingActivity>,
    @InjectRepository(DevelopmentPlan)
    private readonly planRepository: Repository<DevelopmentPlan>,
    @InjectRepository(DevelopmentNeed)
    private readonly needRepository: Repository<DevelopmentNeed>,
  ) {}

  // ==================== SKILLS ====================

  async createSkill(dto: CreateSkillDto, currentUser: any) {
    const skill = this.skillRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.skillRepository.save(skill);
  }

  async getAllSkills() {
    return await this.skillRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async addPersonSkill(dto: CreatePersonSkillDto, currentUser: any) {
    // Can add for self or if HR/Admin
    if (dto.personId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot add skills for other employees');
    }

    const personSkill = this.personSkillRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.personSkillRepository.save(personSkill);
  }

  async getPersonSkills(personId: string) {
    return await this.personSkillRepository.find({
      where: { personId },
      order: { level: 'DESC', createdAt: 'DESC' },
    });
  }

  async validateSkill(id: string, currentUser: any) {
    const personSkill = await this.personSkillRepository.findOne({ where: { id } });
    if (!personSkill) {
      throw new NotFoundException('Skill not found');
    }

    personSkill.validatedBy = currentUser.id;
    personSkill.validatedAt = new Date();
    return await this.personSkillRepository.save(personSkill);
  }

  async getSkillsMatrix(personId: string) {
    const skills = await this.personSkillRepository.find({
      where: { personId },
      order: { level: 'DESC' },
    });

    // Group by category
    const matrix = skills.reduce((acc, skill) => {
      const category = skill.skillId; // Would need to join with Skill entity
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, PersonSkill[]>);

    return matrix;
  }

  // ==================== EDUCATION ====================

  async addEducation(dto: CreateEducationDto, currentUser: any) {
    if (dto.personId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot add education for other employees');
    }

    const education = this.educationRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.educationRepository.save(education);
  }

  async getEducationHistory(personId: string) {
    return await this.educationRepository.find({
      where: { personId },
      order: { startDate: 'DESC' },
    });
  }

  // ==================== QUALIFICATIONS ====================

  async addQualification(dto: CreateQualificationDto, currentUser: any) {
    if (dto.personId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot add qualifications for other employees');
    }

    const qualification = this.qualificationRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.qualificationRepository.save(qualification);
  }

  async getQualifications(personId: string) {
    return await this.qualificationRepository.find({
      where: { personId },
      order: { issueDate: 'DESC' },
    });
  }

  async getExpiringQualifications(daysAhead: number = 90) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await this.qualificationRepository.find({
      where: {
        expiryDate: LessThan(futureDate),
        doesNotExpire: false,
      },
      order: { expiryDate: 'ASC' },
    });
  }

  // ==================== LANGUAGES ====================

  async addLanguage(dto: CreateLanguageDto, currentUser: any) {
    if (dto.personId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot add languages for other employees');
    }

    const language = this.languageRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.languageRepository.save(language);
  }

  async getLanguages(personId: string) {
    return await this.languageRepository.find({
      where: { personId },
      order: { isNative: 'DESC', language: 'ASC' },
    });
  }

  // ==================== LICENSES ====================

  async addLicense(dto: CreateLicenseDto, currentUser: any) {
    if (dto.personId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot add licenses for other employees');
    }

    const license = this.licenseRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.licenseRepository.save(license);
  }

  async getLicenses(personId: string) {
    return await this.licenseRepository.find({
      where: { personId },
      order: { expiryDate: 'ASC' },
    });
  }

  async getExpiringLicenses(daysAhead: number = 90) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await this.licenseRepository.find({
      where: {
        expiryDate: LessThan(futureDate),
      },
      order: { expiryDate: 'ASC' },
    });
  }

  // ==================== TRAINING ====================

  async createTrainingActivity(dto: CreateTrainingActivityDto, currentUser: any) {
    const activity = this.trainingRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.trainingRepository.save(activity);
  }

  async updateTrainingActivity(id: string, dto: UpdateTrainingActivityDto, currentUser: any) {
    const activity = await this.trainingRepository.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException('Training activity not found');
    }

    Object.assign(activity, dto);
    return await this.trainingRepository.save(activity);
  }

  async getTrainingActivities(personId: string) {
    return await this.trainingRepository.find({
      where: { personId },
      order: { dueAt: 'ASC', createdAt: 'DESC' },
    });
  }

  async getTrainingSummary(personId: string) {
    const activities = await this.trainingRepository.find({
      where: { personId },
    });

    const completed = activities.filter(a => a.status === 'COMPLETED').length;
    const inProgress = activities.filter(a => a.status === 'IN_PROGRESS').length;
    const overdue = activities.filter(a => a.isOverdue).length;
    const totalCPDHours = activities
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (Number(a.cpdHours) || 0), 0);

    return {
      completed,
      inProgress,
      overdue,
      totalCPDHours,
    };
  }

  // ==================== DEVELOPMENT PLANS ====================

  async createDevelopmentPlan(dto: CreateDevelopmentPlanDto, currentUser: any) {
    const plan = this.planRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.planRepository.save(plan);
  }

  async getDevelopmentPlans(personId: string) {
    return await this.planRepository.find({
      where: { personId },
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== DEVELOPMENT NEEDS ====================

  async createDevelopmentNeed(dto: CreateDevelopmentNeedDto, currentUser: any) {
    const need = this.needRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.needRepository.save(need);
  }

  async getDevelopmentNeeds(personId: string) {
    return await this.needRepository.find({
      where: { personId },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }
}
