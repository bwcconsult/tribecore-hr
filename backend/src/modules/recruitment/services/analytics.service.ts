import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Requisition, RequisitionStatus } from '../entities/requisition.entity';
import { Application, ApplicationStage, ApplicationStatus } from '../entities/application.entity';
import { Offer, OfferStatus } from '../entities/offer.entity';
import { Interview } from '../entities/interview.entity';
import { Candidate, CandidateSource } from '../entities/candidate.entity';
import { StageLog } from '../entities/stage-log.entity';

export interface FunnelMetrics {
  stage: string;
  count: number;
  percentage: number;
  conversionRate: number;
  avgTimeInStage: number; // days
}

export interface TimeToHireMetrics {
  average: number; // days
  median: number;
  p90: number; // 90th percentile
  fastest: number;
  slowest: number;
  byDepartment: Record<string, number>;
  byJobTitle: Record<string, number>;
}

export interface SourceOfHireMetrics {
  source: string;
  applications: number;
  hires: number;
  conversionRate: number;
  avgTimeToHire: number;
  costPerHire?: number;
}

export interface RecruiterMetrics {
  recruiterId: string;
  recruiterName: string;
  requisitionsManaged: number;
  applicationsProcessed: number;
  interviewsScheduled: number;
  offersExtended: number;
  hiresMade: number;
  avgTimeToHire: number;
  offerAcceptanceRate: number;
}

export interface DiversityMetrics {
  applicantPool: {
    total: number;
    diverse: number;
    diversityPercentage: number;
  };
  hiredPool: {
    total: number;
    diverse: number;
    diversityPercentage: number;
  };
  dropoffByStage: Record<string, { total: number; diverse: number }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionRepo: Repository<Requisition>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(StageLog)
    private readonly stageLogRepo: Repository<StageLog>,
  ) {}

  /**
   * Get recruitment funnel metrics
   */
  async getFunnelMetrics(params: {
    organizationId: string;
    requisitionId?: string;
    departmentId?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<FunnelMetrics[]> {
    let query = this.applicationRepo
      .createQueryBuilder('app')
      .where('app.organizationId = :organizationId', { organizationId: params.organizationId });

    if (params.requisitionId) {
      query = query.andWhere('app.requisitionId = :requisitionId', { requisitionId: params.requisitionId });
    }

    if (params.fromDate && params.toDate) {
      query = query.andWhere('app.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: params.fromDate,
        toDate: params.toDate,
      });
    }

    const applications = await query.getMany();
    const total = applications.length;

    if (total === 0) {
      return [];
    }

    // Count applications by stage
    const stageCounts = new Map<ApplicationStage, number>();
    Object.values(ApplicationStage).forEach(stage => stageCounts.set(stage, 0));

    applications.forEach(app => {
      stageCounts.set(app.stage, (stageCounts.get(app.stage) || 0) + 1);
    });

    // Calculate metrics
    const stages = Object.values(ApplicationStage);
    const funnel: FunnelMetrics[] = [];
    let previousCount = total;

    for (const stage of stages) {
      const count = stageCounts.get(stage) || 0;
      const percentage = (count / total) * 100;
      const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;
      const avgTimeInStage = await this.getAvgTimeInStage(params.organizationId, stage);

      funnel.push({
        stage,
        count,
        percentage: Math.round(percentage * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgTimeInStage,
      });

      previousCount = count;
    }

    return funnel;
  }

  /**
   * Calculate time-to-hire metrics
   */
  async getTimeToHireMetrics(params: {
    organizationId: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<TimeToHireMetrics> {
    // Get all hired applications
    let query = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.jobPosting', 'job')
      .where('app.organizationId = :organizationId', { organizationId: params.organizationId })
      .andWhere('app.status = :status', { status: ApplicationStatus.OFFER_ACCEPTED });

    if (params.fromDate && params.toDate) {
      query = query.andWhere('app.updatedAt BETWEEN :fromDate AND :toDate', {
        fromDate: params.fromDate,
        toDate: params.toDate,
      });
    }

    const hiredApps = await query.getMany();

    if (hiredApps.length === 0) {
      return {
        average: 0,
        median: 0,
        p90: 0,
        fastest: 0,
        slowest: 0,
        byDepartment: {},
        byJobTitle: {},
      };
    }

    // Calculate days from application to hire
    const timeToHireDays = hiredApps.map(app => {
      const created = new Date(app.createdAt).getTime();
      const hired = new Date(app.updatedAt).getTime();
      return Math.round((hired - created) / (1000 * 60 * 60 * 24));
    });

    timeToHireDays.sort((a, b) => a - b);

    const average = timeToHireDays.reduce((a, b) => a + b, 0) / timeToHireDays.length;
    const median = timeToHireDays[Math.floor(timeToHireDays.length / 2)];
    const p90 = timeToHireDays[Math.floor(timeToHireDays.length * 0.9)];
    const fastest = timeToHireDays[0];
    const slowest = timeToHireDays[timeToHireDays.length - 1];

    // By department and job title (simplified)
    const byDepartment: Record<string, number> = {};
    const byJobTitle: Record<string, number> = {};

    return {
      average: Math.round(average),
      median,
      p90,
      fastest,
      slowest,
      byDepartment,
      byJobTitle,
    };
  }

  /**
   * Get source of hire metrics
   */
  async getSourceOfHireMetrics(params: {
    organizationId: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<SourceOfHireMetrics[]> {
    // Get all applications with candidate source
    let query = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .where('app.organizationId = :organizationId', { organizationId: params.organizationId });

    if (params.fromDate && params.toDate) {
      query = query.andWhere('app.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: params.fromDate,
        toDate: params.toDate,
      });
    }

    const applications = await query.getMany();

    // Group by source
    const sourceStats = new Map<CandidateSource, {
      applications: number;
      hires: number;
      totalDaysToHire: number;
    }>();

    Object.values(CandidateSource).forEach(source => {
      sourceStats.set(source, { applications: 0, hires: 0, totalDaysToHire: 0 });
    });

    for (const app of applications) {
      if (!app.candidate) continue;

      const source = app.candidate.source;
      const stats = sourceStats.get(source) || { applications: 0, hires: 0, totalDaysToHire: 0 };
      
      stats.applications++;

      if (app.status === ApplicationStatus.OFFER_ACCEPTED) {
        stats.hires++;
        const days = Math.round(
          (new Date(app.updatedAt).getTime() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        stats.totalDaysToHire += days;
      }

      sourceStats.set(source, stats);
    }

    // Convert to metrics
    const metrics: SourceOfHireMetrics[] = [];

    for (const [source, stats] of sourceStats.entries()) {
      if (stats.applications === 0) continue;

      metrics.push({
        source,
        applications: stats.applications,
        hires: stats.hires,
        conversionRate: Math.round((stats.hires / stats.applications) * 1000) / 10,
        avgTimeToHire: stats.hires > 0 ? Math.round(stats.totalDaysToHire / stats.hires) : 0,
      });
    }

    return metrics.sort((a, b) => b.hires - a.hires);
  }

  /**
   * Get recruiter performance metrics
   */
  async getRecruiterMetrics(params: {
    organizationId: string;
    recruiterId?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<RecruiterMetrics[]> {
    // This would join with user assignments table
    // For now, return mock structure
    return [];
  }

  /**
   * Get offer acceptance metrics
   */
  async getOfferAcceptanceMetrics(params: {
    organizationId: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{
    total: number;
    accepted: number;
    declined: number;
    acceptanceRate: number;
    avgTimeToRespond: number;
    declineReasons: Record<string, number>;
  }> {
    let query = this.offerRepo
      .createQueryBuilder('offer')
      .where('offer.organizationId = :organizationId', { organizationId: params.organizationId })
      .andWhere('offer.status IN (:...statuses)', {
        statuses: [OfferStatus.ACCEPTED, OfferStatus.DECLINED],
      });

    if (params.fromDate && params.toDate) {
      query = query.andWhere('offer.sentAt BETWEEN :fromDate AND :toDate', {
        fromDate: params.fromDate,
        toDate: params.toDate,
      });
    }

    const offers = await query.getMany();

    const total = offers.length;
    const accepted = offers.filter(o => o.status === OfferStatus.ACCEPTED).length;
    const declined = offers.filter(o => o.status === OfferStatus.DECLINED).length;
    const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;

    // Calculate avg time to respond
    let totalResponseTime = 0;
    let responseCount = 0;

    for (const offer of offers) {
      if (offer.sentAt && offer.respondedAt) {
        const days = Math.round(
          (new Date(offer.respondedAt).getTime() - new Date(offer.sentAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        totalResponseTime += days;
        responseCount++;
      }
    }

    const avgTimeToRespond = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

    // Decline reasons
    const declineReasons: Record<string, number> = {};
    offers
      .filter(o => o.status === OfferStatus.DECLINED && o.declineReason)
      .forEach(o => {
        declineReasons[o.declineReason!] = (declineReasons[o.declineReason!] || 0) + 1;
      });

    return {
      total,
      accepted,
      declined,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      avgTimeToRespond,
      declineReasons,
    };
  }

  /**
   * Get cost per hire
   */
  async getCostPerHire(params: {
    organizationId: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{
    totalCost: number;
    totalHires: number;
    costPerHire: number;
    breakdown: {
      agencyFees: number;
      backgroundChecks: number;
      jobBoardFees: number;
      other: number;
    };
  }> {
    // This would aggregate costs from various sources
    // For now, return mock structure
    return {
      totalCost: 0,
      totalHires: 0,
      costPerHire: 0,
      breakdown: {
        agencyFees: 0,
        backgroundChecks: 0,
        jobBoardFees: 0,
        other: 0,
      },
    };
  }

  /**
   * Get interview to offer ratio
   */
  async getInterviewToOfferRatio(params: {
    organizationId: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{
    totalInterviews: number;
    totalOffers: number;
    ratio: number;
  }> {
    let interviewQuery = this.interviewRepo
      .createQueryBuilder('interview')
      .where('interview.organizationId = :organizationId', { organizationId: params.organizationId });

    let offerQuery = this.offerRepo
      .createQueryBuilder('offer')
      .where('offer.organizationId = :organizationId', { organizationId: params.organizationId });

    if (params.fromDate && params.toDate) {
      interviewQuery = interviewQuery.andWhere('interview.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: params.fromDate,
        toDate: params.toDate,
      });
      offerQuery = offerQuery.andWhere('offer.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: params.fromDate,
        toDate: params.toDate,
      });
    }

    const totalInterviews = await interviewQuery.getCount();
    const totalOffers = await offerQuery.getCount();
    const ratio = totalInterviews > 0 ? totalOffers / totalInterviews : 0;

    return {
      totalInterviews,
      totalOffers,
      ratio: Math.round(ratio * 100) / 100,
    };
  }

  /**
   * Get forecasted hires vs actual
   */
  async getForecastAccuracy(params: {
    organizationId: string;
    year: number;
    quarter?: number;
  }): Promise<{
    forecasted: number;
    actual: number;
    accuracy: number;
    variance: number;
  }> {
    // This would compare headcount plans vs actual hires
    // For now, return mock structure
    return {
      forecasted: 0,
      actual: 0,
      accuracy: 0,
      variance: 0,
    };
  }

  /**
   * Get requisition aging report
   */
  async getRequisitionAging(params: {
    organizationId: string;
  }): Promise<Array<{
    requisitionId: string;
    jobTitle: string;
    daysOpen: number;
    status: RequisitionStatus;
    applicationsCount: number;
    pipelineHealth: 'GOOD' | 'WARNING' | 'CRITICAL';
  }>> {
    const openRequisitions = await this.requisitionRepo.find({
      where: {
        organizationId: params.organizationId,
        status: RequisitionStatus.OPEN,
      },
    });

    const report = openRequisitions.map(req => {
      const daysOpen = Math.round(
        (Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      let pipelineHealth: 'GOOD' | 'WARNING' | 'CRITICAL' = 'GOOD';
      if (daysOpen > 90) pipelineHealth = 'CRITICAL';
      else if (daysOpen > 60) pipelineHealth = 'WARNING';

      return {
        requisitionId: req.id,
        jobTitle: req.jobTitle,
        daysOpen,
        status: req.status,
        applicationsCount: req.applicationsReceived,
        pipelineHealth,
      };
    });

    return report.sort((a, b) => b.daysOpen - a.daysOpen);
  }

  // Private helper methods

  private async getAvgTimeInStage(organizationId: string, stage: ApplicationStage): Promise<number> {
    // Query stage logs to calculate avg time spent in each stage
    // This would aggregate duration from stage logs
    // For now, return mock value
    return 5; // days
  }
}
