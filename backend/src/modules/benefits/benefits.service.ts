import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BenefitPlan, BenefitEnrollment, BenefitStatus } from './entities/benefit.entity';
import { CreateBenefitDto, CreateEmployeeBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto, UpdateEmployeeBenefitDto } from './dto/update-benefit.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(BenefitPlan)
    private readonly benefitPlanRepository: Repository<BenefitPlan>,
    @InjectRepository(BenefitEnrollment)
    private readonly benefitEnrollmentRepository: Repository<BenefitEnrollment>,
  ) {}

  // Benefit Plan Methods
  async createBenefit(createBenefitDto: CreateBenefitDto): Promise<BenefitPlan> {
    const benefit = this.benefitPlanRepository.create(createBenefitDto);
    return await this.benefitPlanRepository.save(benefit);
  }

  async findAllBenefits(
    organizationId: string,
    paginationDto: PaginationDto,
    userRoles?: string[],
  ): Promise<{ data: BenefitPlan[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.benefitPlanRepository
      .createQueryBuilder('benefit')
      .where('benefit.active = :active', { active: true });
    
    // SUPER_ADMIN can see all benefits across all organizations
    const isSuperAdmin = userRoles?.includes('SUPER_ADMIN');
    if (!isSuperAdmin) {
      query.andWhere('benefit.organizationId = :organizationId', { organizationId });
    }

    if (search) {
      query.andWhere(
        '(benefit.name ILIKE :search OR benefit.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('benefit.createdAt', 'DESC')
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

  async findBenefitById(id: string): Promise<BenefitPlan> {
    const benefit = await this.benefitPlanRepository.findOne({ where: { id } });
    if (!benefit) {
      throw new NotFoundException(`Benefit with ID ${id} not found`);
    }
    return benefit;
  }

  async updateBenefit(id: string, updateBenefitDto: UpdateBenefitDto): Promise<BenefitPlan> {
    const benefit = await this.findBenefitById(id);
    Object.assign(benefit, updateBenefitDto);
    return await this.benefitPlanRepository.save(benefit);
  }

  async deleteBenefit(id: string): Promise<void> {
    const benefit = await this.findBenefitById(id);
    await this.benefitPlanRepository.remove(benefit);
  }

  // Employee Benefit Enrollment Methods
  async enrollEmployee(createEmployeeBenefitDto: CreateEmployeeBenefitDto): Promise<BenefitEnrollment> {
    // Calculate totalCost
    const totalCost = createEmployeeBenefitDto.employeeCost + createEmployeeBenefitDto.employerCost;
    const enrollment = this.benefitEnrollmentRepository.create({
      ...createEmployeeBenefitDto,
      totalCost,
    });
    return await this.benefitEnrollmentRepository.save(enrollment);
  }

  async findAllEnrollments(): Promise<any> {
    const enrollments = await this.benefitEnrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.benefitPlan', 'plan')
      .orderBy('enrollment.enrollmentDate', 'DESC')
      .getMany();

    // Map to frontend format
    const data = enrollments.map(e => ({
      id: e.id,
      employeeId: e.employeeId,
      employeeName: 'Employee', // Will be populated by frontend from employee service
      benefitPlanId: e.benefitPlanId,
      benefitPlanName: e.benefitPlan?.name,
      enrollmentDate: e.enrollmentDate,
      effectiveDate: e.effectiveDate,
      endDate: e.endDate,
      status: e.status,
      coverage: e.coverageLevel,
      employeeContribution: e.employeeCost,
      employerContribution: e.employerCost,
      totalCost: e.totalCost,
      dependents: e.dependents,
      notes: e.notes,
      createdAt: e.createdAt,
    }));

    return { data };
  }

  async findEmployeeBenefits(
    employeeId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: BenefitEnrollment[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.benefitEnrollmentRepository.findAndCount({
      where: { employeeId },
      relations: ['benefitPlan'],
      order: { enrollmentDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findEmployeeBenefitById(id: string): Promise<BenefitEnrollment> {
    const enrollment = await this.benefitEnrollmentRepository.findOne({
      where: { id },
      relations: ['benefitPlan'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Employee benefit with ID ${id} not found`);
    }
    return enrollment;
  }

  async updateEmployeeBenefit(
    id: string,
    updateEmployeeBenefitDto: UpdateEmployeeBenefitDto,
  ): Promise<BenefitEnrollment> {
    const enrollment = await this.findEmployeeBenefitById(id);
    Object.assign(enrollment, updateEmployeeBenefitDto);
    
    // Recalculate totalCost if costs changed
    if (updateEmployeeBenefitDto.employeeCost || updateEmployeeBenefitDto.employerCost) {
      enrollment.totalCost = enrollment.employeeCost + enrollment.employerCost;
    }
    
    return await this.benefitEnrollmentRepository.save(enrollment);
  }

  async deleteEmployeeBenefit(id: string): Promise<void> {
    const enrollment = await this.findEmployeeBenefitById(id);
    await this.benefitEnrollmentRepository.remove(enrollment);
  }

  async getBenefitStats(): Promise<any> {
    const [
      totalEnrollments,
      activeEnrollments,
      plansCount,
    ] = await Promise.all([
      this.benefitEnrollmentRepository.count(),
      this.benefitEnrollmentRepository.count({ where: { status: BenefitStatus.ACTIVE } }),
      this.benefitPlanRepository.count({ where: { active: true } }),
    ]);

    const activeEnrollmentRecords = await this.benefitEnrollmentRepository.find({
      where: { status: BenefitStatus.ACTIVE },
    });

    const totalMonthlyCost = activeEnrollmentRecords.reduce(
      (sum, enrollment) => sum + Number(enrollment.totalCost),
      0,
    );

    return {
      totalEnrollments,
      activeEnrollments,
      totalMonthlyCost,
      plansCount,
    };
  }
}
