import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessionPlan, ReadinessLevel } from '../entities/succession-plan.entity';

@Injectable()
export class SuccessionPlanningService {
  constructor(
    @InjectRepository(SuccessionPlan)
    private successionRepo: Repository<SuccessionPlan>,
  ) {}

  async createPlan(data: Partial<SuccessionPlan>): Promise<SuccessionPlan> {
    const planCode = await this.generatePlanCode(data.organizationId!);
    const plan = this.successionRepo.create({
      ...data,
      planCode,
      successorCount: data.successors?.length || 0,
      readyNowCount: data.successors?.filter(s => s.readinessLevel === ReadinessLevel.READY_NOW).length || 0,
    });
    return await this.successionRepo.save(plan);
  }

  async getPlanById(id: string): Promise<SuccessionPlan> {
    const plan = await this.successionRepo.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Succession plan not found');
    }
    return plan;
  }

  async getOrganizationPlans(organizationId: string): Promise<SuccessionPlan[]> {
    return await this.successionRepo.find({
      where: { organizationId, isActive: true },
      order: { criticalityLevel: 'DESC' },
    });
  }

  async getCriticalPlans(organizationId: string): Promise<SuccessionPlan[]> {
    return await this.successionRepo.find({
      where: {
        organizationId,
        criticalityLevel: 'CRITICAL' as any,
        isActive: true,
      },
    });
  }

  async addSuccessor(
    planId: string,
    successor: {
      employeeId: string;
      employeeName: string;
      currentPosition: string;
      department: string;
      readinessLevel: ReadinessLevel;
    }
  ): Promise<SuccessionPlan> {
    const plan = await this.getPlanById(planId);
    
    plan.successors = [
      ...(plan.successors || []),
      {
        ...successor,
        readinessAssessmentDate: new Date(),
        overallFitScore: 70,
        strengthsGaps: { strengths: [], gaps: [] },
        developmentPlan: { developmentActions: [], estimatedReadyDate: new Date() },
        isPrimarySuccessor: plan.successors.length === 0,
        isEmergencyBackup: false,
      },
    ];

    plan.successorCount = plan.successors.length;
    plan.readyNowCount = plan.successors.filter(s => s.readinessLevel === ReadinessLevel.READY_NOW).length;

    return await this.successionRepo.save(plan);
  }

  async getSuccessionStats(organizationId: string) {
    const plans = await this.getOrganizationPlans(organizationId);

    return {
      totalPositions: plans.length,
      critical: plans.filter(p => p.criticalityLevel === 'CRITICAL').length,
      withSuccessors: plans.filter(p => p.successorCount > 0).length,
      readyNow: plans.reduce((sum, p) => sum + p.readyNowCount, 0),
      averageBenchStrength: plans.reduce((sum, p) => sum + (p.benchStrength || 0), 0) / plans.length,
      atRisk: plans.filter(p => p.successorCount === 0 && p.criticalityLevel === 'CRITICAL').length,
    };
  }

  private async generatePlanCode(organizationId: string): Promise<string> {
    const count = await this.successionRepo.count({ where: { organizationId } });
    return `SUC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
}
