import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position, PositionStatus } from '../entities/position.entity';
import { OrgScenario } from '../entities/org-scenario.entity';

@Injectable()
export class PositionManagementService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
    @InjectRepository(OrgScenario)
    private readonly scenarioRepo: Repository<OrgScenario>,
  ) {}

  async createPosition(data: Partial<Position>): Promise<Position> {
    const count = await this.positionRepo.count({ where: { organizationId: data.organizationId } });
    const positionId = `POS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    
    const position = this.positionRepo.create({
      ...data,
      positionId,
      status: PositionStatus.PENDING_APPROVAL,
    });
    
    return this.positionRepo.save(position);
  }

  async getPositionsByOrg(organizationId: string): Promise<Position[]> {
    return this.positionRepo.find({
      where: { organizationId },
      relations: ['incumbent', 'reportsToPosition'],
      order: { reportingLevel: 'ASC' },
    });
  }

  async getVacantPositions(organizationId: string): Promise<Position[]> {
    return this.positionRepo.find({
      where: { organizationId, isVacant: true },
      order: { daysVacant: 'DESC' },
    });
  }

  async getOrgChart(organizationId: string): Promise<any> {
    const positions = await this.getPositionsByOrg(organizationId);
    
    // Build tree structure
    const positionMap = new Map(positions.map(p => [p.id, { ...p, children: [] }]));
    const rootPositions = [];
    
    positions.forEach(p => {
      if (p.reportsToPositionId && positionMap.has(p.reportsToPositionId)) {
        positionMap.get(p.reportsToPositionId).children.push(positionMap.get(p.id));
      } else {
        rootPositions.push(positionMap.get(p.id));
      }
    });
    
    return rootPositions;
  }

  async createScenario(data: Partial<OrgScenario>): Promise<OrgScenario> {
    const count = await this.scenarioRepo.count({ where: { organizationId: data.organizationId } });
    const scenarioId = `SCN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    
    const scenario = this.scenarioRepo.create({
      ...data,
      scenarioId,
    });
    
    return this.scenarioRepo.save(scenario);
  }

  async getScenarios(organizationId: string): Promise<OrgScenario[]> {
    return this.scenarioRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async getWorkforcePlanningMetrics(organizationId: string): Promise<any> {
    const positions = await this.getPositionsByOrg(organizationId);
    
    const total = positions.length;
    const vacant = positions.filter(p => p.isVacant).length;
    const filled = total - vacant;
    const totalFTE = positions.reduce((sum, p) => sum + p.fte, 0);
    const totalBudget = positions.reduce((sum, p) => sum + (p.annualBudget || 0), 0);
    
    return {
      totalPositions: total,
      filledPositions: filled,
      vacantPositions: vacant,
      fillRate: (filled / total) * 100,
      totalFTE,
      totalBudget,
      avgDaysVacant: vacant > 0 
        ? positions.filter(p => p.isVacant).reduce((sum, p) => sum + p.daysVacant, 0) / vacant 
        : 0,
    };
  }
}
