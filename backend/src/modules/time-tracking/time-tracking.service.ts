import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry, Project } from './entities/time-entry.entity';
import { CreateTimeEntryDto, CreateProjectDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto, UpdateProjectDto } from './dto/update-time-entry.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  // Time Entry Methods
  async createTimeEntry(createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    const entry = this.timeEntryRepository.create(createTimeEntryDto);
    const saved = await this.timeEntryRepository.save(entry);

    // Update project total hours
    if (createTimeEntryDto.projectId) {
      await this.projectRepository.increment(
        { id: createTimeEntryDto.projectId },
        'totalHoursLogged',
        createTimeEntryDto.hours,
      );
    }

    return saved;
  }

  async findAllTimeEntries(
    employeeId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: TimeEntry[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.timeEntryRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.project', 'project')
      .where('entry.employeeId = :employeeId', { employeeId });

    if (search) {
      query.andWhere(
        '(entry.description ILIKE :search OR entry.taskName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('entry.date', 'DESC')
      .addOrderBy('entry.startTime', 'DESC')
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

  async findTimeEntryById(id: string): Promise<TimeEntry> {
    const entry = await this.timeEntryRepository.findOne({
      where: { id },
      relations: ['project', 'employee'],
    });
    if (!entry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }
    return entry;
  }

  async updateTimeEntry(id: string, updateTimeEntryDto: UpdateTimeEntryDto): Promise<TimeEntry> {
    const entry = await this.findTimeEntryById(id);
    Object.assign(entry, updateTimeEntryDto);
    return await this.timeEntryRepository.save(entry);
  }

  async deleteTimeEntry(id: string): Promise<void> {
    const entry = await this.findTimeEntryById(id);
    await this.timeEntryRepository.remove(entry);
  }

  async startTimer(employeeId: string, createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    const entry = this.timeEntryRepository.create({
      ...createTimeEntryDto,
      employeeId,
      date: new Date(),
      startTime: new Date().toISOString(),
    });
    return await this.timeEntryRepository.save(entry);
  }

  async stopTimer(id: string): Promise<TimeEntry> {
    const entry = await this.findTimeEntryById(id);
    const endTime = new Date();
    const startTime = new Date(entry.startTime);
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    
    entry.endTime = endTime.toISOString();
    entry.durationMinutes = durationMinutes;
    entry.hours = Number((durationMinutes / 60).toFixed(2));
    
    return await this.timeEntryRepository.save(entry);
  }

  // Project Methods
  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return await this.projectRepository.save(project);
  }

  async findAllProjects(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: Project[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.projectRepository
      .createQueryBuilder('project')
      .where('project.organizationId = :organizationId', { organizationId });

    if (search) {
      query.andWhere(
        '(project.name ILIKE :search OR project.clientName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('project.createdAt', 'DESC')
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

  async findProjectById(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findProjectById(id);
    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.findProjectById(id);
    await this.projectRepository.remove(project);
  }
}
