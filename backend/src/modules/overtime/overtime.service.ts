import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OvertimeRequest, OvertimeStatus, OvertimeType } from './entities/overtime-request.entity';
import { OvertimePolicy } from './entities/overtime-policy.entity';
import { CreateOvertimeRequestDto, CreateOvertimePolicyDto } from './dto/create-overtime.dto';

@Injectable()
export class OvertimeService {
  constructor(
    @InjectRepository(OvertimeRequest)
    private overtimeRepository: Repository<OvertimeRequest>,
    @InjectRepository(OvertimePolicy)
    private policyRepository: Repository<OvertimePolicy>,
  ) {}

  // ===== OVERTIME REQUESTS =====

  async createOvertimeRequest(createDto: CreateOvertimeRequestDto): Promise<OvertimeRequest> {
    const hours = this.calculateHours(new Date(createDto.startTime), new Date(createDto.endTime));
    const policy = await this.getActivePolicy(createDto.organizationId);

    // Check if exceeds limits
    if (policy) {
      await this.validateOvertimeLimits(createDto.employeeId, hours, policy);
    }

    const multiplier = this.getMultiplier(createDto.overtimeType || OvertimeType.REGULAR, policy);

    const request = this.overtimeRepository.create({
      ...createDto,
      hours,
      multiplier,
      status: createDto.metadata?.isPreApproved ? OvertimeStatus.APPROVED : OvertimeStatus.PENDING,
    });

    return this.overtimeRepository.save(request);
  }

  async findAllOvertimeRequests(filters: {
    organizationId?: string;
    employeeId?: string;
    status?: OvertimeStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<OvertimeRequest[]> {
    const queryBuilder = this.overtimeRepository.createQueryBuilder('overtime');

    if (filters.organizationId) {
      queryBuilder.andWhere('overtime.organizationId = :orgId', { orgId: filters.organizationId });
    }

    if (filters.employeeId) {
      queryBuilder.andWhere('overtime.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters.status) {
      queryBuilder.andWhere('overtime.status = :status', { status: filters.status });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('overtime.date BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return queryBuilder.orderBy('overtime.date', 'DESC').getMany();
  }

  async getOvertimeRequestById(id: string): Promise<OvertimeRequest> {
    const request = await this.overtimeRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Overtime request not found');
    }
    return request;
  }

  async approveOvertimeRequest(id: string, approvedBy: string, hourlyRate?: number): Promise<OvertimeRequest> {
    const request = await this.getOvertimeRequestById(id);

    if (request.status !== OvertimeStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }

    request.status = OvertimeStatus.APPROVED;
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();

    if (hourlyRate && request.multiplier) {
      request.calculatedPay = Number(request.hours) * hourlyRate * Number(request.multiplier);
    }

    return this.overtimeRepository.save(request);
  }

  async rejectOvertimeRequest(id: string, rejectionReason: string): Promise<OvertimeRequest> {
    const request = await this.getOvertimeRequestById(id);

    if (request.status !== OvertimeStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    request.status = OvertimeStatus.REJECTED;
    request.rejectionReason = rejectionReason;

    return this.overtimeRepository.save(request);
  }

  async cancelOvertimeRequest(id: string, employeeId: string): Promise<OvertimeRequest> {
    const request = await this.getOvertimeRequestById(id);

    if (request.employeeId !== employeeId) {
      throw new BadRequestException('You can only cancel your own requests');
    }

    if (request.status === OvertimeStatus.APPROVED) {
      throw new BadRequestException('Cannot cancel approved overtime');
    }

    request.status = OvertimeStatus.CANCELLED;
    return this.overtimeRepository.save(request);
  }

  async markAsPaid(id: string, payrollId: string): Promise<OvertimeRequest> {
    const request = await this.getOvertimeRequestById(id);
    request.isPaid = true;
    request.paidInPayrollId = payrollId;
    return this.overtimeRepository.save(request);
  }

  // ===== POLICIES =====

  async createPolicy(createDto: CreateOvertimePolicyDto): Promise<OvertimePolicy> {
    const policy = this.policyRepository.create(createDto);
    return this.policyRepository.save(policy);
  }

  async getActivePolicy(organizationId: string): Promise<OvertimePolicy | null> {
    return this.policyRepository.findOne({
      where: { organizationId, isActive: true },
    });
  }

  async getPolicyById(id: string): Promise<OvertimePolicy> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException('Policy not found');
    }
    return policy;
  }

  async updatePolicy(id: string, updateDto: Partial<CreateOvertimePolicyDto>): Promise<OvertimePolicy> {
    const policy = await this.getPolicyById(id);
    Object.assign(policy, updateDto);
    return this.policyRepository.save(policy);
  }

  // ===== ANALYTICS =====

  async getEmployeeOvertimeStats(employeeId: string, startDate: Date, endDate: Date) {
    const requests = await this.overtimeRepository.find({
      where: {
        employeeId,
        status: OvertimeStatus.APPROVED,
        date: Between(startDate, endDate),
      },
    });

    const totalHours = requests.reduce((sum, r) => sum + Number(r.hours), 0);
    const totalPay = requests.reduce((sum, r) => sum + Number(r.calculatedPay || 0), 0);

    const byType = requests.reduce((acc, r) => {
      acc[r.overtimeType] = (acc[r.overtimeType] || 0) + Number(r.hours);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalHours,
      totalPay,
      requestCount: requests.length,
      byType,
      unpaidHours: requests.filter((r) => !r.isPaid).reduce((sum, r) => sum + Number(r.hours), 0),
    };
  }

  async getOrganizationOvertimeAnalytics(organizationId: string, startDate: Date, endDate: Date) {
    const requests = await this.findAllOvertimeRequests({
      organizationId,
      startDate,
      endDate,
    });

    const approved = requests.filter((r) => r.status === OvertimeStatus.APPROVED);
    const totalHours = approved.reduce((sum, r) => sum + Number(r.hours), 0);
    const totalCost = approved.reduce((sum, r) => sum + Number(r.calculatedPay || 0), 0);

    const byEmployee = approved.reduce((acc, r) => {
      if (!acc[r.employeeId]) {
        acc[r.employeeId] = { hours: 0, cost: 0, count: 0 };
      }
      acc[r.employeeId].hours += Number(r.hours);
      acc[r.employeeId].cost += Number(r.calculatedPay || 0);
      acc[r.employeeId].count += 1;
      return acc;
    }, {} as Record<string, { hours: number; cost: number; count: number }>);

    const pending = requests.filter((r) => r.status === OvertimeStatus.PENDING).length;

    return {
      totalHours,
      totalCost,
      totalRequests: requests.length,
      approvedRequests: approved.length,
      pendingRequests: pending,
      byEmployee: Object.entries(byEmployee)
        .sort(([, a], [, b]) => b.hours - a.hours)
        .slice(0, 10),
    };
  }

  // ===== UTILITIES =====

  private calculateHours(startTime: Date, endTime: Date): number {
    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = durationMs / (1000 * 60 * 60);
    return Number(hours.toFixed(2));
  }

  private getMultiplier(overtimeType: OvertimeType, policy: OvertimePolicy | null): number {
    if (!policy) return 1.5; // Default

    switch (overtimeType) {
      case OvertimeType.WEEKEND:
        return Number(policy.weekendOvertimeMultiplier);
      case OvertimeType.HOLIDAY:
        return Number(policy.holidayOvertimeMultiplier);
      case OvertimeType.NIGHT_SHIFT:
        return Number(policy.nightShiftMultiplier);
      default:
        return Number(policy.regularOvertimeMultiplier);
    }
  }

  private async validateOvertimeLimits(
    employeeId: string,
    hours: number,
    policy: OvertimePolicy,
  ): Promise<void> {
    if (policy.maxOvertimeHoursPerWeek) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weeklyHours = await this.getEmployeeOvertimeStats(employeeId, weekStart, weekEnd);
      if (weeklyHours.totalHours + hours > policy.maxOvertimeHoursPerWeek) {
        throw new BadRequestException(
          `Exceeds weekly overtime limit of ${policy.maxOvertimeHoursPerWeek} hours`,
        );
      }
    }

    if (policy.maxOvertimeHoursPerMonth) {
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthlyHours = await this.getEmployeeOvertimeStats(employeeId, monthStart, monthEnd);
      if (monthlyHours.totalHours + hours > policy.maxOvertimeHoursPerMonth) {
        throw new BadRequestException(
          `Exceeds monthly overtime limit of ${policy.maxOvertimeHoursPerMonth} hours`,
        );
      }
    }
  }
}
