import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobApplication } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
  ) {}

  // Job Methods
  async createJob(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create(createJobDto);
    return await this.jobRepository.save(job);
  }

  async findAllJobs(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: Job[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.jobRepository
      .createQueryBuilder('job')
      .where('job.organizationId = :organizationId', { organizationId });

    if (search) {
      query.andWhere(
        '(job.title ILIKE :search OR job.department ILIKE :search OR job.location ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('job.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findJobById(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async updateJob(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.findJobById(id);
    Object.assign(job, updateJobDto);
    return await this.jobRepository.save(job);
  }

  async deleteJob(id: string): Promise<void> {
    const job = await this.findJobById(id);
    await this.jobRepository.remove(job);
  }

  async getJobStats(organizationId: string) {
    const [totalJobs, openJobs, closedJobs, totalApplications] = await Promise.all([
      this.jobRepository.count({ where: { organizationId } }),
      this.jobRepository.count({ where: { organizationId, status: 'OPEN' } }),
      this.jobRepository.count({ where: { organizationId, status: 'CLOSED' } }),
      this.applicationRepository.count(),
    ]);

    return {
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
    };
  }

  // Application Methods
  async createApplication(createApplicationDto: CreateApplicationDto): Promise<JobApplication> {
    const application = this.applicationRepository.create(createApplicationDto);
    const saved = await this.applicationRepository.save(application);

    // Increment applications count
    await this.jobRepository.increment(
      { id: createApplicationDto.jobId },
      'applicationsCount',
      1,
    );

    return saved;
  }

  async findAllApplications(
    jobId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: JobApplication[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.applicationRepository
      .createQueryBuilder('application')
      .where('application.jobId = :jobId', { jobId });

    if (search) {
      query.andWhere(
        '(application.firstName ILIKE :search OR application.lastName ILIKE :search OR application.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findApplicationById(id: string): Promise<JobApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job'],
    });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  async updateApplication(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<JobApplication> {
    const application = await this.findApplicationById(id);
    Object.assign(application, updateApplicationDto);
    return await this.applicationRepository.save(application);
  }

  async deleteApplication(id: string): Promise<void> {
    const application = await this.findApplicationById(id);
    await this.applicationRepository.remove(application);
  }
}
