import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalApplication, ApplicationStatus } from '../entities/internal-application.entity';
import { InternalJobsService } from './internal-jobs.service';
import { ApplyForJobDto, ApproveApplicationDto, RejectApplicationDto } from '../dto/apply-for-job.dto';

@Injectable()
export class InternalApplicationsService {
  constructor(
    @InjectRepository(InternalApplication)
    private appRepo: Repository<InternalApplication>,
    private jobsService: InternalJobsService,
  ) {}

  async submitApplication(dto: ApplyForJobDto): Promise<InternalApplication> {
    // Check if job exists and is open
    const job = await this.jobsService.getJobById(dto.jobPostingId);
    if (job.status !== 'OPEN') {
      throw new BadRequestException('This job posting is not accepting applications');
    }

    // Check if already applied
    const existing = await this.appRepo.findOne({
      where: {
        jobPostingId: dto.jobPostingId,
        employeeId: dto.employeeId,
        status: ApplicationStatus.SUBMITTED as any, // Add type assertion
      },
    });

    if (existing) {
      throw new BadRequestException('You have already applied for this position');
    }

    const applicationNumber = await this.generateApplicationNumber(job.organizationId);

    const application = this.appRepo.create({
      ...dto,
      organizationId: job.organizationId,
      applicationNumber,
      status: ApplicationStatus.SUBMITTED,
      appliedDate: new Date(),
      timeline: [
        {
          stage: 'Application Submitted',
          status: 'COMPLETED',
          date: new Date(),
          actor: dto.employeeId,
        },
      ],
    });

    const savedApp = await this.appRepo.save(application);

    // Increment application count on job
    await this.jobsService.incrementApplicationCount(dto.jobPostingId);

    return savedApp;
  }

  async getApplicationById(id: string): Promise<InternalApplication> {
    const app = await this.appRepo.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    return app;
  }

  async getEmployeeApplications(employeeId: string): Promise<InternalApplication[]> {
    return await this.appRepo.find({
      where: { employeeId },
      order: { appliedDate: 'DESC' },
    });
  }

  async getJobApplications(jobPostingId: string): Promise<InternalApplication[]> {
    return await this.appRepo.find({
      where: { jobPostingId },
      order: { appliedDate: 'DESC' },
    });
  }

  async approveByManager(applicationId: string, dto: ApproveApplicationDto): Promise<InternalApplication> {
    const app = await this.getApplicationById(applicationId);

    if (app.status !== ApplicationStatus.SUBMITTED) {
      throw new BadRequestException('Application cannot be approved in current status');
    }

    app.managerApproval = {
      status: 'APPROVED',
      approvedBy: dto.approvedBy,
      approvalDate: new Date(),
      comments: dto.comments,
      willingToRelease: true,
    };

    app.status = ApplicationStatus.MANAGER_APPROVED;

    app.timeline = [
      ...(app.timeline || []),
      {
        stage: 'Manager Approval',
        status: 'APPROVED',
        date: new Date(),
        actor: dto.approvedBy,
        notes: dto.comments,
      },
    ];

    return await this.appRepo.save(app);
  }

  async rejectByManager(applicationId: string, dto: RejectApplicationDto): Promise<InternalApplication> {
    const app = await this.getApplicationById(applicationId);

    app.managerApproval = {
      status: 'DECLINED',
      approvedBy: dto.rejectedBy,
      approvalDate: new Date(),
      comments: dto.rejectionReason,
      willingToRelease: false,
    };

    app.status = ApplicationStatus.MANAGER_DECLINED;
    app.rejectionReason = dto.rejectionReason;

    app.timeline = [
      ...(app.timeline || []),
      {
        stage: 'Manager Approval',
        status: 'DECLINED',
        date: new Date(),
        actor: dto.rejectedBy,
        notes: dto.rejectionReason,
      },
    ];

    return await this.appRepo.save(app);
  }

  async approveByHR(applicationId: string, dto: ApproveApplicationDto): Promise<InternalApplication> {
    const app = await this.getApplicationById(applicationId);

    app.hrApproval = {
      status: 'APPROVED',
      approvedBy: dto.approvedBy,
      approvalDate: new Date(),
      comments: dto.comments,
      eligibilityVerified: true,
    };

    app.status = ApplicationStatus.HR_REVIEW;

    app.timeline = [
      ...(app.timeline || []),
      {
        stage: 'HR Approval',
        status: 'APPROVED',
        date: new Date(),
        actor: dto.approvedBy,
        notes: dto.comments,
      },
    ];

    return await this.appRepo.save(app);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    actor?: string,
    notes?: string
  ): Promise<InternalApplication> {
    const app = await this.getApplicationById(applicationId);
    app.status = status;

    app.timeline = [
      ...(app.timeline || []),
      {
        stage: status,
        status: 'UPDATED',
        date: new Date(),
        actor,
        notes,
      },
    ];

    return await this.appRepo.save(app);
  }

  async withdrawApplication(applicationId: string, reason: string): Promise<InternalApplication> {
    const app = await this.getApplicationById(applicationId);
    app.status = ApplicationStatus.WITHDRAWN;
    app.withdrawalReason = reason;

    app.timeline = [
      ...(app.timeline || []),
      {
        stage: 'Withdrawn',
        status: 'WITHDRAWN',
        date: new Date(),
        actor: app.employeeId,
        notes: reason,
      },
    ];

    return await this.appRepo.save(app);
  }

  async getApplicationStats(organizationId: string) {
    const apps = await this.appRepo.find({ where: { organizationId } });

    return {
      total: apps.length,
      submitted: apps.filter(a => a.status === ApplicationStatus.SUBMITTED).length,
      managerReview: apps.filter(a => a.status === ApplicationStatus.MANAGER_REVIEW).length,
      managerApproved: apps.filter(a => a.status === ApplicationStatus.MANAGER_APPROVED).length,
      managerDeclined: apps.filter(a => a.status === ApplicationStatus.MANAGER_DECLINED).length,
      transferred: apps.filter(a => a.status === ApplicationStatus.TRANSFERRED).length,
      rejected: apps.filter(a => a.status === ApplicationStatus.REJECTED).length,
      withdrawn: apps.filter(a => a.status === ApplicationStatus.WITHDRAWN).length,
      averageTimeToTransfer: this.calculateAverageTime(apps),
    };
  }

  private async generateApplicationNumber(organizationId: string): Promise<string> {
    const count = await this.appRepo.count({ where: { organizationId } });
    const year = new Date().getFullYear();
    return `APP-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  private calculateAverageTime(apps: InternalApplication[]): number {
    const transferred = apps.filter(a => a.status === ApplicationStatus.TRANSFERRED && a.transferDate);
    if (transferred.length === 0) return 0;

    const totalDays = transferred.reduce((sum, app) => {
      const days = Math.floor(
        (new Date(app.transferDate!).getTime() - new Date(app.appliedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0);

    return Math.round(totalDays / transferred.length);
  }
}
