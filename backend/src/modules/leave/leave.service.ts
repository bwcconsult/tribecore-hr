import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Leave } from './entities/leave.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private leaveRepository: Repository<Leave>,
  ) {}

  async create(createLeaveDto: CreateLeaveDto): Promise<Leave> {
    // Calculate number of days
    const startDate = new Date(createLeaveDto.startDate);
    const endDate = new Date(createLeaveDto.endDate);
    const numberOfDays = this.calculateWorkingDays(startDate, endDate);

    const leave = this.leaveRepository.create({
      ...createLeaveDto,
      numberOfDays,
    });

    return this.leaveRepository.save(leave);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Leave>> {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee');

    if (search) {
      queryBuilder.andWhere(
        '(employee.firstName ILIKE :search OR employee.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`leave.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('leave.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Leave> {
    const leave = await this.leaveRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    return leave;
  }

  async findByEmployee(employeeId: string): Promise<Leave[]> {
    return this.leaveRepository.find({
      where: { employeeId },
      order: { startDate: 'DESC' },
    });
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto): Promise<Leave> {
    const leave = await this.findOne(id);
    Object.assign(leave, updateLeaveDto);
    return this.leaveRepository.save(leave);
  }

  async approveLeave(id: string, approvedBy: string): Promise<Leave> {
    const leave = await this.findOne(id);
    
    if (leave.status !== 'PENDING' as any) {
      throw new BadRequestException('Only pending leave requests can be approved');
    }

    leave.status = 'APPROVED' as any;
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date();

    return this.leaveRepository.save(leave);
  }

  async rejectLeave(id: string, rejectionReason: string, approvedBy: string): Promise<Leave> {
    const leave = await this.findOne(id);
    
    if (leave.status !== 'PENDING' as any) {
      throw new BadRequestException('Only pending leave requests can be rejected');
    }

    leave.status = 'REJECTED' as any;
    leave.rejectionReason = rejectionReason;
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date();

    return this.leaveRepository.save(leave);
  }

  async getLeaveBalance(employeeId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const leaves = await this.leaveRepository.find({
      where: {
        employeeId,
        status: 'APPROVED' as any,
        startDate: Between(startDate, endDate),
      },
    });

    const annualLeave = leaves
      .filter((l) => l.leaveType === 'ANNUAL' as any)
      .reduce((sum, l) => sum + Number(l.numberOfDays), 0);

    const sickLeave = leaves
      .filter((l) => l.leaveType === 'SICK' as any)
      .reduce((sum, l) => sum + Number(l.numberOfDays), 0);

    return {
      annualLeave: {
        used: annualLeave,
        remaining: 25 - annualLeave, // Default 25 days
      },
      sickLeave: {
        used: sickLeave,
        remaining: 10 - sickLeave, // Default 10 days
      },
    };
  }

  async remove(id: string): Promise<void> {
    const leave = await this.findOne(id);
    await this.leaveRepository.softDelete(id);
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Exclude weekends
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}
