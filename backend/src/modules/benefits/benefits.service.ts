import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Benefit, EmployeeBenefit } from './entities/benefit.entity';
import { CreateBenefitDto, CreateEmployeeBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto, UpdateEmployeeBenefitDto } from './dto/update-benefit.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(EmployeeBenefit)
    private readonly employeeBenefitRepository: Repository<EmployeeBenefit>,
  ) {}

  // Benefit Plan Methods
  async createBenefit(createBenefitDto: CreateBenefitDto): Promise<Benefit> {
    const benefit = this.benefitRepository.create(createBenefitDto);
    return await this.benefitRepository.save(benefit);
  }

  async findAllBenefits(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: Benefit[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.benefitRepository
      .createQueryBuilder('benefit')
      .where('benefit.organizationId = :organizationId', { organizationId });

    if (search) {
      query.andWhere(
        '(benefit.name ILIKE :search OR benefit.provider ILIKE :search)',
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

  async findBenefitById(id: string): Promise<Benefit> {
    const benefit = await this.benefitRepository.findOne({ where: { id } });
    if (!benefit) {
      throw new NotFoundException(`Benefit with ID ${id} not found`);
    }
    return benefit;
  }

  async updateBenefit(id: string, updateBenefitDto: UpdateBenefitDto): Promise<Benefit> {
    const benefit = await this.findBenefitById(id);
    Object.assign(benefit, updateBenefitDto);
    return await this.benefitRepository.save(benefit);
  }

  async deleteBenefit(id: string): Promise<void> {
    const benefit = await this.findBenefitById(id);
    await this.benefitRepository.remove(benefit);
  }

  // Employee Benefit Enrollment Methods
  async enrollEmployee(createEmployeeBenefitDto: CreateEmployeeBenefitDto): Promise<EmployeeBenefit> {
    const enrollment = this.employeeBenefitRepository.create(createEmployeeBenefitDto);
    return await this.employeeBenefitRepository.save(enrollment);
  }

  async findEmployeeBenefits(
    employeeId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: EmployeeBenefit[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.employeeBenefitRepository.findAndCount({
      where: { employeeId },
      relations: ['benefit'],
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

  async findEmployeeBenefitById(id: string): Promise<EmployeeBenefit> {
    const enrollment = await this.employeeBenefitRepository.findOne({
      where: { id },
      relations: ['benefit'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Employee benefit with ID ${id} not found`);
    }
    return enrollment;
  }

  async updateEmployeeBenefit(
    id: string,
    updateEmployeeBenefitDto: UpdateEmployeeBenefitDto,
  ): Promise<EmployeeBenefit> {
    const enrollment = await this.findEmployeeBenefitById(id);
    Object.assign(enrollment, updateEmployeeBenefitDto);
    return await this.employeeBenefitRepository.save(enrollment);
  }

  async deleteEmployeeBenefit(id: string): Promise<void> {
    const enrollment = await this.findEmployeeBenefitById(id);
    await this.employeeBenefitRepository.remove(enrollment);
  }
}
