import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseDelegate } from '../entities/delegate.entity';
import { ExpenseOutOfOffice } from '../entities/out-of-office.entity';
import { CreateDelegateDto } from '../dto/create-delegate.dto';
import { CreateOutOfOfficeDto } from '../dto/create-out-of-office.dto';

@Injectable()
export class DelegateService {
  constructor(
    @InjectRepository(ExpenseDelegate)
    private delegateRepository: Repository<ExpenseDelegate>,
    @InjectRepository(ExpenseOutOfOffice)
    private outOfOfficeRepository: Repository<ExpenseOutOfOffice>,
  ) {}

  // Delegate Management
  async createDelegate(createDelegateDto: CreateDelegateDto): Promise<ExpenseDelegate> {
    const delegate = this.delegateRepository.create(createDelegateDto);
    return this.delegateRepository.save(delegate);
  }

  async findAllDelegates(employeeId: string): Promise<ExpenseDelegate[]> {
    return this.delegateRepository.find({
      where: { employeeId },
      relations: ['delegateEmployee'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveDelegates(employeeId: string): Promise<ExpenseDelegate[]> {
    const today = new Date();
    
    return this.delegateRepository
      .createQueryBuilder('delegate')
      .leftJoinAndSelect('delegate.delegateEmployee', 'employee')
      .where('delegate.employeeId = :employeeId', { employeeId })
      .andWhere('delegate.isActive = :isActive', { isActive: true })
      .andWhere(
        '(delegate.startDate IS NULL OR delegate.startDate <= :today)',
        { today }
      )
      .andWhere(
        '(delegate.endDate IS NULL OR delegate.endDate >= :today)',
        { today }
      )
      .getMany();
  }

  async findDelegatesFor(delegateEmployeeId: string): Promise<ExpenseDelegate[]> {
    return this.delegateRepository.find({
      where: { delegateEmployeeId, isActive: true },
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateDelegate(id: string, updateData: Partial<CreateDelegateDto>): Promise<ExpenseDelegate> {
    const delegate = await this.delegateRepository.findOne({ where: { id } });
    
    if (!delegate) {
      throw new NotFoundException(`Delegate with ID ${id} not found`);
    }

    Object.assign(delegate, updateData);
    return this.delegateRepository.save(delegate);
  }

  async deactivateDelegate(id: string): Promise<ExpenseDelegate> {
    const delegate = await this.delegateRepository.findOne({ where: { id } });
    
    if (!delegate) {
      throw new NotFoundException(`Delegate with ID ${id} not found`);
    }

    delegate.isActive = false;
    return this.delegateRepository.save(delegate);
  }

  async deleteDelegate(id: string): Promise<void> {
    const delegate = await this.delegateRepository.findOne({ where: { id } });
    
    if (!delegate) {
      throw new NotFoundException(`Delegate with ID ${id} not found`);
    }

    await this.delegateRepository.remove(delegate);
  }

  // Out of Office Management
  async createOutOfOffice(createOutOfOfficeDto: CreateOutOfOfficeDto): Promise<ExpenseOutOfOffice> {
    // Check for overlapping out of office periods
    const overlapping = await this.outOfOfficeRepository
      .createQueryBuilder('ooo')
      .where('ooo.employeeId = :employeeId', { employeeId: createOutOfOfficeDto.employeeId })
      .andWhere('ooo.isActive = :isActive', { isActive: true })
      .andWhere(
        '(ooo.startDate <= :endDate AND ooo.endDate >= :startDate)',
        {
          startDate: createOutOfOfficeDto.startDate,
          endDate: createOutOfOfficeDto.endDate,
        }
      )
      .getOne();

    if (overlapping) {
      throw new BadRequestException('You already have an out of office period during this time');
    }

    const outOfOffice = this.outOfOfficeRepository.create(createOutOfOfficeDto);
    return this.outOfOfficeRepository.save(outOfOffice);
  }

  async findAllOutOfOffice(employeeId: string): Promise<ExpenseOutOfOffice[]> {
    return this.outOfOfficeRepository.find({
      where: { employeeId },
      relations: ['substituteEmployee'],
      order: { startDate: 'DESC' },
    });
  }

  async findActiveOutOfOffice(employeeId: string): Promise<ExpenseOutOfOffice | null> {
    const today = new Date();
    
    return this.outOfOfficeRepository
      .createQueryBuilder('ooo')
      .leftJoinAndSelect('ooo.substituteEmployee', 'substitute')
      .where('ooo.employeeId = :employeeId', { employeeId })
      .andWhere('ooo.isActive = :isActive', { isActive: true })
      .andWhere('ooo.startDate <= :today', { today })
      .andWhere('ooo.endDate >= :today', { today })
      .getOne();
  }

  async findSubstituteFor(substituteEmployeeId: string): Promise<ExpenseOutOfOffice[]> {
    const today = new Date();
    
    return this.outOfOfficeRepository
      .createQueryBuilder('ooo')
      .leftJoinAndSelect('ooo.employee', 'employee')
      .where('ooo.substituteEmployeeId = :substituteEmployeeId', { substituteEmployeeId })
      .andWhere('ooo.isActive = :isActive', { isActive: true })
      .andWhere('ooo.startDate <= :today', { today })
      .andWhere('ooo.endDate >= :today', { today })
      .getMany();
  }

  async updateOutOfOffice(id: string, updateData: Partial<CreateOutOfOfficeDto>): Promise<ExpenseOutOfOffice> {
    const outOfOffice = await this.outOfOfficeRepository.findOne({ where: { id } });
    
    if (!outOfOffice) {
      throw new NotFoundException(`Out of office record with ID ${id} not found`);
    }

    Object.assign(outOfOffice, updateData);
    return this.outOfOfficeRepository.save(outOfOffice);
  }

  async deactivateOutOfOffice(id: string): Promise<ExpenseOutOfOffice> {
    const outOfOffice = await this.outOfOfficeRepository.findOne({ where: { id } });
    
    if (!outOfOffice) {
      throw new NotFoundException(`Out of office record with ID ${id} not found`);
    }

    outOfOffice.isActive = false;
    return this.outOfOfficeRepository.save(outOfOffice);
  }

  async deleteOutOfOffice(id: string): Promise<void> {
    const outOfOffice = await this.outOfOfficeRepository.findOne({ where: { id } });
    
    if (!outOfOffice) {
      throw new NotFoundException(`Out of office record with ID ${id} not found`);
    }

    await this.outOfOfficeRepository.remove(outOfOffice);
  }

  // Helper methods
  async canApproveOnBehalf(delegateEmployeeId: string, employeeId: string): Promise<boolean> {
    const delegates = await this.findActiveDelegates(employeeId);
    return delegates.some(
      d => d.delegateEmployeeId === delegateEmployeeId && d.canApproveOnBehalf
    );
  }

  async getActiveSubstitute(employeeId: string): Promise<string | null> {
    const activeOOO = await this.findActiveOutOfOffice(employeeId);
    return activeOOO?.substituteEmployeeId || null;
  }
}
