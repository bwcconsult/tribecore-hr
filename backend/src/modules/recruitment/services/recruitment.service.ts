import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisition, RequisitionStatus } from '../entities/requisition.entity';
import { JobPosting, PostingStatus } from '../entities/job-posting.entity';
import { Candidate, ConsentStatus } from '../entities/candidate.entity';
import { Application, ApplicationStage, ApplicationStatus } from '../entities/application.entity';
import { Interview, InterviewOutcome } from '../entities/interview.entity';
import { Offer, OfferStatus } from '../entities/offer.entity';

/**
 * RecruitmentService
 * Full-cycle applicant tracking system
 */
@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(Requisition)
    private reqRepo: Repository<Requisition>,
    @InjectRepository(JobPosting)
    private jobRepo: Repository<JobPosting>,
    @InjectRepository(Candidate)
    private candidateRepo: Repository<Candidate>,
    @InjectRepository(Application)
    private appRepo: Repository<Application>,
    @InjectRepository(Interview)
    private interviewRepo: Repository<Interview>,
    @InjectRepository(Offer)
    private offerRepo: Repository<Offer>,
  ) {}

  /**
   * Create requisition
   */
  async createRequisition(data: {
    organizationId: string;
    departmentId: string;
    jobTitle: string;
    headcount: number;
    budgetAmount?: number;
    hiringManagerId: string;
    reason: any;
    businessJustification?: string;
    targetStartDate?: Date;
  }): Promise<Requisition> {
    const req = this.reqRepo.create({
      ...data,
      status: RequisitionStatus.DRAFT,
    });

    // Auto-generate approval chain
    req.approvals = [
      {
        approverId: data.hiringManagerId,
        approverName: 'Hiring Manager',
        role: 'Manager',
        status: 'PENDING',
      },
      {
        approverId: 'FINANCE_HEAD',
        approverName: 'Finance Head',
        role: 'Finance',
        status: 'PENDING',
      },
      {
        approverId: 'HR_HEAD',
        approverName: 'HR Head',
        role: 'HR',
        status: 'PENDING',
      },
    ];

    return this.reqRepo.save(req);
  }

  /**
   * Approve requisition step
   */
  async approveRequisition(
    reqId: string,
    approverId: string,
    comments?: string,
  ): Promise<Requisition> {
    const req = await this.reqRepo.findOne({ where: { id: reqId } });
    if (!req) throw new NotFoundException('Requisition not found');

    const approval = req.approvals.find(a => a.approverId === approverId);
    if (!approval) throw new BadRequestException('Not authorized to approve');

    approval.status = 'APPROVED';
    approval.decidedAt = new Date();
    approval.comments = comments;

    // Check if all approved
    const allApproved = req.approvals.every(a => a.status === 'APPROVED');
    if (allApproved) {
      req.fullyApproved = true;
      req.approvedAt = new Date();
      req.status = RequisitionStatus.APPROVED;
    }

    return this.reqRepo.save(req);
  }

  /**
   * Create job posting from requisition
   */
  async createJobPosting(data: {
    requisitionId: string;
    title: string;
    description: string;
    salaryMin?: number;
    salaryMax?: number;
    showSalary?: boolean;
    location: string;
    remote?: boolean;
    competencies?: string[];
  }): Promise<JobPosting> {
    const req = await this.reqRepo.findOne({ where: { id: data.requisitionId } });
    if (!req) throw new NotFoundException('Requisition not found');

    if (req.status !== RequisitionStatus.APPROVED) {
      throw new BadRequestException('Requisition must be approved first');
    }

    const job = this.jobRepo.create({
      ...data,
      organizationId: req.organizationId,
      employmentType: 'Full-time',
      status: PostingStatus.DRAFT,
    });

    await this.jobRepo.save(job);

    // Update requisition
    req.jobsCreated++;
    await this.reqRepo.save(req);

    return job;
  }

  /**
   * Publish job to channels
   */
  async publishJob(
    jobId: string,
    channels: Array<{ name: string; url: string }>,
  ): Promise<JobPosting> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    job.status = PostingStatus.ACTIVE;
    job.postedAt = new Date();
    job.channels = channels.map(c => ({
      ...c,
      postedAt: new Date(),
    }));

    return this.jobRepo.save(job);
  }

  /**
   * Create or find candidate
   */
  async upsertCandidate(data: {
    organizationId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    source: any;
    metadata?: any;
  }): Promise<Candidate> {
    // Check if candidate exists
    let candidate = await this.candidateRepo.findOne({
      where: { email: data.email, organizationId: data.organizationId },
    });

    if (candidate) {
      // Update existing
      Object.assign(candidate, data);
    } else {
      // Create new
      candidate = this.candidateRepo.create({
        ...data,
        consentGivenAt: new Date(),
        consentStatus: ConsentStatus.GIVEN,
      });

      // Set consent expiry (1 year GDPR)
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      candidate.consentExpiresAt = expiry;
    }

    return this.candidateRepo.save(candidate);
  }

  /**
   * Submit application
   */
  async submitApplication(data: {
    candidateId: string;
    jobPostingId: string;
    organizationId: string;
    resumeUrl?: string;
    coverLetterUrl?: string;
    screeningAnswers?: any[];
  }): Promise<Application> {
    const job = await this.jobRepo.findOne({ where: { id: data.jobPostingId } });
    if (!job) throw new NotFoundException('Job not found');

    // Check for knockout questions
    let knockedOut = false;
    if (data.screeningAnswers) {
      knockedOut = data.screeningAnswers.some(a => a.isKnockout && a.knockoutFailed);
    }

    const app = this.appRepo.create({
      ...data,
      stage: ApplicationStage.NEW,
      status: knockedOut ? ApplicationStatus.REJECTED : ApplicationStatus.ACTIVE,
    });

    if (knockedOut) {
      app.rejectionReason = 'Failed knockout question(s)';
      app.rejectedAt = new Date();
    }

    await this.appRepo.save(app);

    // Update metrics
    job.applications++;
    await this.jobRepo.save(job);

    const candidate = await this.candidateRepo.findOne({ where: { id: data.candidateId } });
    if (candidate) {
      candidate.applicationsCount++;
      await this.candidateRepo.save(candidate);
    }

    return app;
  }

  /**
   * Move application to next stage
   */
  async advanceApplication(
    appId: string,
    nextStage: ApplicationStage,
  ): Promise<Application> {
    const app = await this.appRepo.findOne({ where: { id: appId } });
    if (!app) throw new NotFoundException('Application not found');

    if (app.status !== ApplicationStatus.ACTIVE) {
      throw new BadRequestException('Cannot advance inactive application');
    }

    app.advance(nextStage);

    return this.appRepo.save(app);
  }

  /**
   * Reject application
   */
  async rejectApplication(
    appId: string,
    reason: string,
    feedback?: string,
  ): Promise<Application> {
    const app = await this.appRepo.findOne({ where: { id: appId } });
    if (!app) throw new NotFoundException('Application not found');

    app.reject(reason, feedback);

    return this.appRepo.save(app);
  }

  /**
   * Schedule interview
   */
  async scheduleInterview(data: {
    applicationId: string;
    organizationId: string;
    type: any;
    panel: Array<{ userId: string; name: string; role: string }>;
    scheduledStart: Date;
    scheduledEnd: Date;
    location?: string;
    meetingLink?: string;
  }): Promise<Interview> {
    const app = await this.appRepo.findOne({ where: { id: data.applicationId } });
    if (!app) throw new NotFoundException('Application not found');

    const interview = this.interviewRepo.create({
      ...data,
      outcome: InterviewOutcome.PENDING,
    });

    // Set feedback due date (2 days after interview)
    const feedbackDue = new Date(data.scheduledEnd);
    feedbackDue.setDate(feedbackDue.getDate() + 2);
    interview.feedbackDueAt = feedbackDue;

    await this.interviewRepo.save(interview);

    // Update candidate metrics
    const candidate = await this.candidateRepo.findOne({
      where: { id: app.candidateId },
    });
    if (candidate) {
      candidate.interviewsCount++;
      await this.candidateRepo.save(candidate);
    }

    return interview;
  }

  /**
   * Submit interview feedback
   */
  async submitInterviewFeedback(
    interviewId: string,
    panelId: string,
    scorecard: {
      scores: Array<{
        competency: string;
        score: number;
        maxScore: number;
        notes: string;
      }>;
      overallRating: number;
      recommendation: InterviewOutcome;
      feedback: string;
    },
  ): Promise<Interview> {
    const interview = await this.interviewRepo.findOne({ where: { id: interviewId } });
    if (!interview) throw new NotFoundException('Interview not found');

    // Add scorecard
    interview.scorecards.push({
      panelId,
      submittedAt: new Date(),
      ...scorecard,
    });

    // If all feedback in, calculate consensus
    if (interview.isAllFeedbackIn()) {
      const avgScore = interview.getAverageScore();
      const recommendations = interview.scorecards.map(s => s.recommendation);

      // Simple consensus: majority vote
      const strongYes = recommendations.filter(r => r === InterviewOutcome.STRONG_YES).length;
      const yes = recommendations.filter(r => r === InterviewOutcome.YES).length;

      if (strongYes >= interview.panel.length / 2) {
        interview.outcome = InterviewOutcome.STRONG_YES;
      } else if (strongYes + yes >= interview.panel.length / 2) {
        interview.outcome = InterviewOutcome.YES;
      } else {
        interview.outcome = InterviewOutcome.NO;
      }
    }

    return this.interviewRepo.save(interview);
  }

  /**
   * Create offer
   */
  async createOffer(data: {
    applicationId: string;
    candidateId: string;
    organizationId: string;
    jobTitle: string;
    department: string;
    baseSalary: number;
    proposedStartDate: Date;
    benefits?: any[];
    metadata?: any;
  }): Promise<Offer> {
    const app = await this.appRepo.findOne({ where: { id: data.applicationId } });
    if (!app) throw new NotFoundException('Application not found');

    const offer = this.offerRepo.create({
      ...data,
      status: OfferStatus.DRAFT,
    });

    // Calculate total comp
    offer.calculateTotalComp();

    // Set expiry (14 days)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);
    offer.expiresAt = expiry;

    // Set approval chain if outside band
    if (offer.requiresCompException) {
      offer.approvals = [
        { approverId: 'HR_HEAD', approverName: 'HR Head', role: 'HR', status: 'PENDING' },
        { approverId: 'CFO', approverName: 'CFO', role: 'Finance', status: 'PENDING' },
      ];
    }

    await this.offerRepo.save(offer);

    // Update candidate metrics
    const candidate = await this.candidateRepo.findOne({ where: { id: data.candidateId } });
    if (candidate) {
      candidate.offersCount++;
      await this.candidateRepo.save(candidate);
    }

    return offer;
  }

  /**
   * Accept offer
   */
  async acceptOffer(offerId: string): Promise<Offer> {
    const offer = await this.offerRepo.findOne({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.isExpired()) {
      throw new BadRequestException('Offer has expired');
    }

    offer.status = OfferStatus.ACCEPTED;
    offer.signedAt = new Date();
    offer.respondedAt = new Date();

    await this.offerRepo.save(offer);

    // Update application
    const app = await this.appRepo.findOne({ where: { id: offer.applicationId } });
    if (app) {
      app.stage = ApplicationStage.HIRED;
      app.status = ApplicationStatus.OFFER_ACCEPTED;
      await this.appRepo.save(app);
    }

    return offer;
  }

  /**
   * Get recruitment pipeline metrics
   */
  async getPipelineMetrics(organizationId: string): Promise<any> {
    const applications = await this.appRepo.find({ where: { organizationId } });

    const stageBreakdown = applications.reduce((acc, app) => {
      acc[app.stage] = (acc[app.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusBreakdown = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: applications.length,
      byStage: stageBreakdown,
      byStatus: statusBreakdown,
      conversionRates: this.calculateConversionRates(applications),
    };
  }

  /**
   * Calculate stage conversion rates
   */
  private calculateConversionRates(applications: Application[]): any {
    const stages = Object.values(ApplicationStage);
    const rates: any = {};

    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const nextStage = stages[i + 1];

      const atCurrent = applications.filter(a => a.stage === currentStage).length;
      const reachedNext = applications.filter(
        a => a.stage === nextStage || stages.indexOf(a.stage) > i + 1,
      ).length;

      rates[`${currentStage}_to_${nextStage}`] = atCurrent > 0
        ? ((reachedNext / atCurrent) * 100).toFixed(1) + '%'
        : 'N/A';
    }

    return rates;
  }
}
