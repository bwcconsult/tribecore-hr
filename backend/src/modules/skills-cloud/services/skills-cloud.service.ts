import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';
import { EmployeeSkill, ProficiencyLevel } from '../entities/employee-skill.entity';
import { MarketplaceOpportunity } from '../entities/marketplace-opportunity.entity';

@Injectable()
export class SkillsCloudService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepo: Repository<EmployeeSkill>,
    @InjectRepository(MarketplaceOpportunity)
    private readonly opportunityRepo: Repository<MarketplaceOpportunity>,
  ) {}

  async createSkill(data: Partial<Skill>): Promise<Skill> {
    const skillCode = `SKILL-${data.skillName?.toUpperCase().replace(/\s+/g, '-')}`;
    return this.skillRepo.save({ ...data, skillCode });
  }

  async addEmployeeSkill(data: Partial<EmployeeSkill>): Promise<EmployeeSkill> {
    return this.employeeSkillRepo.save(data);
  }

  async getEmployeeSkills(employeeId: string): Promise<EmployeeSkill[]> {
    return this.employeeSkillRepo.find({
      where: { employeeId },
      relations: ['skill'],
      order: { proficiencyLevel: 'DESC' },
    });
  }

  async findEmployeesBySkill(skillId: string, minProficiency: ProficiencyLevel): Promise<EmployeeSkill[]> {
    return this.employeeSkillRepo.find({
      where: { skillId },
      relations: ['employee'],
    });
  }

  async getSkillGaps(organizationId: string): Promise<any> {
    const allSkills = await this.skillRepo.find({ where: { organizationId, isCritical: true } });
    const gaps = [];

    for (const skill of allSkills) {
      const employeeCount = await this.employeeSkillRepo.count({ where: { skillId: skill.id } });
      if (employeeCount < 3) {
        gaps.push({ skill: skill.skillName, employeeCount, gap: 3 - employeeCount });
      }
    }

    return gaps;
  }

  async createOpportunity(data: Partial<MarketplaceOpportunity>): Promise<MarketplaceOpportunity> {
    const count = await this.opportunityRepo.count({ where: { organizationId: data.organizationId } });
    const opportunityId = `OPP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    return this.opportunityRepo.save({ ...data, opportunityId });
  }

  async getOpenOpportunities(organizationId: string): Promise<MarketplaceOpportunity[]> {
    return this.opportunityRepo.find({
      where: { organizationId, status: 'OPEN' },
      order: { postedAt: 'DESC' },
    });
  }

  async matchEmployeesToOpportunity(opportunityId: string): Promise<any[]> {
    const opportunity = await this.opportunityRepo.findOne({ where: { id: opportunityId } });
    if (!opportunity) return [];

    // Find employees with required skills
    const matches = await this.employeeSkillRepo
      .createQueryBuilder('es')
      .where('es.skillId IN (:...skillIds)', { skillIds: opportunity.requiredSkills })
      .groupBy('es.employeeId')
      .having('COUNT(DISTINCT es.skillId) >= :count', { count: opportunity.requiredSkills.length })
      .getMany();

    return matches;
  }
}
