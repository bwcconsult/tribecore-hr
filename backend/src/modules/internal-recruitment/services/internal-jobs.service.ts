import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalJobPosting, JobStatus } from '../entities/internal-job-posting.entity';
import { CreateJobPostingDto } from '../dto/create-job-posting.dto';

@Injectable()
export class InternalJobsService {
  constructor(
    @InjectRepository(InternalJobPosting)
    private jobRepo: Repository<InternalJobPosting>,
  ) {}

  async createJobPosting(dto: CreateJobPostingDto, postedBy: string): Promise<InternalJobPosting> {
    const jobCode = await this.generateJobCode(dto.organizationId);

    const job = this.jobRepo.create({
      ...dto,
      jobCode,
      postedBy,
      postedDate: new Date(),
      status: JobStatus.OPEN,
      applicationCount: 0,
      viewCount: 0,
    } as any);

    const saved = await this.jobRepo.save(job);
    return saved;
  }

  async getJobById(id: string): Promise<InternalJobPosting> {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job posting not found');
    }
    return job;
  }

  async getAllJobs(
    organizationId: string,
    filters?: {
      status?: JobStatus;
      departmentId?: string;
      jobType?: string;
      employeeId?: string; // For filtering visible jobs to employee
    }
  ): Promise<InternalJobPosting[]> {
    const query = this.jobRepo.createQueryBuilder('job');
    query.where('job.organizationId = :organizationId', { organizationId });

    if (filters?.status) {
      query.andWhere('job.status = :status', { status: filters.status });
    }

    if (filters?.departmentId) {
      query.andWhere('job.departmentId = :departmentId', { departmentId: filters.departmentId });
    }

    if (filters?.jobType) {
      query.andWhere('job.jobType = :jobType', { jobType: filters.jobType });
    }

    query.orderBy('job.postedDate', 'DESC');

    return await query.getMany();
  }

  async searchJobs(organizationId: string, searchTerm: string): Promise<InternalJobPosting[]> {
    return await this.jobRepo
      .createQueryBuilder('job')
      .where('job.organizationId = :organizationId', { organizationId })
      .andWhere('job.status = :status', { status: JobStatus.OPEN })
      .andWhere('(job.jobTitle ILIKE :search OR job.description ILIKE :search)', {
        search: `%${searchTerm}%`,
      })
      .orderBy('job.postedDate', 'DESC')
      .getMany();
  }

  async updateJobPosting(id: string, updates: Partial<InternalJobPosting>): Promise<InternalJobPosting> {
    const job = await this.getJobById(id);
    Object.assign(job, updates);
    return await this.jobRepo.save(job);
  }

  async closeJobPosting(id: string): Promise<InternalJobPosting> {
    const job = await this.getJobById(id);
    job.status = JobStatus.CLOSED;
    return await this.jobRepo.save(job);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.jobRepo.increment({ id }, 'viewCount', 1);
  }

  async incrementApplicationCount(id: string): Promise<void> {
    await this.jobRepo.increment({ id }, 'applicationCount', 1);
  }

  async getJobsByDepartment(organizationId: string, departmentId: string): Promise<InternalJobPosting[]> {
    return await this.jobRepo.find({
      where: {
        organizationId,
        departmentId,
        status: JobStatus.OPEN,
      },
      order: { postedDate: 'DESC' },
    });
  }

  async getUrgentJobs(organizationId: string): Promise<InternalJobPosting[]> {
    return await this.jobRepo.find({
      where: {
        organizationId,
        status: JobStatus.OPEN,
        isUrgent: true,
      },
      order: { postedDate: 'DESC' },
    });
  }

  async getJobStats(organizationId: string) {
    const jobs = await this.jobRepo.find({ where: { organizationId } });

    return {
      total: jobs.length,
      open: jobs.filter(j => j.status === JobStatus.OPEN).length,
      filled: jobs.filter(j => j.status === JobStatus.FILLED).length,
      closed: jobs.filter(j => j.status === JobStatus.CLOSED).length,
      urgent: jobs.filter(j => j.isUrgent && j.status === JobStatus.OPEN).length,
      totalApplications: jobs.reduce((sum, j) => sum + j.applicationCount, 0),
      totalViews: jobs.reduce((sum, j) => sum + j.viewCount, 0),
      byDepartment: this.groupByDepartment(jobs),
      byType: this.groupByType(jobs),
    };
  }

  private async generateJobCode(organizationId: string): Promise<string> {
    const count = await this.jobRepo.count({ where: { organizationId } });
    const year = new Date().getFullYear();
    return `INTJOB-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private groupByDepartment(jobs: InternalJobPosting[]) {
    const grouped: Record<string, number> = {};
    jobs.forEach(job => {
      grouped[job.departmentName] = (grouped[job.departmentName] || 0) + 1;
    });
    return grouped;
  }

  private groupByType(jobs: InternalJobPosting[]) {
    const grouped: Record<string, number> = {};
    jobs.forEach(job => {
      grouped[job.jobType] = (grouped[job.jobType] || 0) + 1;
    });
    return grouped;
  }
}
