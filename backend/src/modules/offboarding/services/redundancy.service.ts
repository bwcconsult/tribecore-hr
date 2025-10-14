import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedundancyGroup } from '../entities/redundancy-group.entity';

/**
 * RedundancyService
 * Handles collective redundancy consultation and selection
 */
@Injectable()
export class RedundancyService {
  constructor(
    @InjectRepository(RedundancyGroup)
    private groupRepo: Repository<RedundancyGroup>,
  ) {}

  /**
   * Create redundancy group
   */
  async createGroup(data: {
    organizationId: string;
    name: string;
    site?: string;
    businessUnit?: string;
    affectedHeadcount: number;
    startDate: Date;
    country: string;
  }): Promise<RedundancyGroup> {
    const group = this.groupRepo.create(data);

    // Calculate consultation requirements
    const consultationDays = group.calculateConsultationDays(data.country);
    group.consultationDays = consultationDays;

    if (group.requiresCollectiveConsultation(data.country)) {
      const consultationEndDate = new Date(data.startDate);
      consultationEndDate.setDate(consultationEndDate.getDate() + consultationDays);
      group.consultationEndDate = consultationEndDate;
    }

    return this.groupRepo.save(group);
  }

  /**
   * Add selection criteria to group
   */
  async addSelectionCriteria(
    groupId: string,
    criteria: Array<{
      name: string;
      description: string;
      weight: number;
      reverseScore?: boolean;
      maxScore: number;
    }>,
  ): Promise<RedundancyGroup> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new BadRequestException('Group not found');

    // Validate weights sum to 100
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new BadRequestException('Criteria weights must sum to 100');
    }

    // Add IDs to criteria
    group.selectionCriteria = criteria.map((c, i) => ({
      ...c,
      id: `CRIT_${i + 1}`,
      reverseScore: c.reverseScore || false,
    }));

    return this.groupRepo.save(group);
  }

  /**
   * Calculate fairness metrics for selection scores
   */
  async calculateFairnessMetrics(
    groupId: string,
    scores: Array<{
      employeeId: string;
      totalScore: number;
      demographics: {
        age?: number;
        gender?: string;
        ethnicity?: string;
        disability?: boolean;
      };
    }>,
  ): Promise<{
    overallStats: any;
    demographicAnalysis: any;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    // Overall statistics
    const totalScores = scores.map(s => s.totalScore);
    const mean = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
    const variance = totalScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / totalScores.length;
    const stdDev = Math.sqrt(variance);

    // Demographic analysis
    const byGender = this.groupBy(scores, s => s.demographics.gender);
    const byAge = this.groupBy(scores, s => {
      if (!s.demographics.age) return 'Unknown';
      if (s.demographics.age < 40) return '<40';
      if (s.demographics.age < 50) return '40-49';
      return '50+';
    });

    // Check for adverse impact (80% rule)
    const genderAnalysis = Object.entries(byGender).map(([gender, group]) => {
      const avgScore = group.reduce((a, b) => a + b.totalScore, 0) / group.length;
      return { gender, avgScore, count: group.length };
    });

    // Flag if any group's avg score < 80% of highest
    const maxAvg = Math.max(...genderAnalysis.map(g => g.avgScore));
    genderAnalysis.forEach(g => {
      if (g.avgScore < maxAvg * 0.8) {
        warnings.push(`Potential adverse impact: ${g.gender} group avg score is ${((g.avgScore / maxAvg) * 100).toFixed(1)}% of highest`);
      }
    });

    return {
      overallStats: {
        mean: mean.toFixed(2),
        stdDev: stdDev.toFixed(2),
        min: Math.min(...totalScores),
        max: Math.max(...totalScores),
      },
      demographicAnalysis: {
        byGender: genderAnalysis,
        byAge: Object.entries(byAge).map(([range, group]) => ({
          ageRange: range,
          avgScore: (group.reduce((a, b) => a + b.totalScore, 0) / group.length).toFixed(2),
          count: group.length,
        })),
      },
      warnings,
    };
  }

  /**
   * Helper: Group by function
   */
  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((result, item) => {
      const key = keyFn(item) || 'Unknown';
      if (!result[key]) result[key] = [];
      result[key].push(item);
      return result;
    }, {} as Record<string, T[]>);
  }

  /**
   * Start consultation process
   */
  async startConsultation(groupId: string): Promise<RedundancyGroup> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new BadRequestException('Group not found');

    group.consultationStatus = 'IN_PROGRESS';
    group.consultationStartDate = new Date();

    return this.groupRepo.save(group);
  }

  /**
   * Log consultation meeting
   */
  async logMeeting(
    groupId: string,
    meeting: {
      date: Date;
      attendees: string[];
      minutes: string;
      documentsUrl: string[];
    },
  ): Promise<RedundancyGroup> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new BadRequestException('Group not found');

    group.consultationMeetings.push(meeting);

    return this.groupRepo.save(group);
  }

  /**
   * Complete consultation
   */
  async completeConsultation(groupId: string): Promise<RedundancyGroup> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new BadRequestException('Group not found');

    if (!group.canProceedWithDismissals()) {
      throw new BadRequestException('Cannot complete: legal requirements not met');
    }

    group.consultationStatus = 'COMPLETED';

    return this.groupRepo.save(group);
  }
}
