import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advance, AdvanceStatus } from '../entities/advance.entity';
import { CreateAdvanceDto } from '../dto/create-advance.dto';

@Injectable()
export class AdvanceService {
  constructor(
    @InjectRepository(Advance)
    private readonly advanceRepository: Repository<Advance>,
  ) {}

  async create(createAdvanceDto: CreateAdvanceDto, createdBy?: string): Promise<Advance> {
    const advance = this.advanceRepository.create({
      ...createAdvanceDto,
      status: AdvanceStatus.PENDING,
    });

    return await this.advanceRepository.save(advance);
  }

  async findAll(filters?: {
    employeeId?: string;
    status?: AdvanceStatus;
    tripId?: string;
  }): Promise<Advance[]> {
    const query = this.advanceRepository.createQueryBuilder('advance')
      .leftJoinAndSelect('advance.employee', 'employee')
      .leftJoinAndSelect('advance.approver', 'approver')
      .leftJoinAndSelect('advance.trip', 'trip');

    if (filters?.employeeId) {
      query.andWhere('advance.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters?.status) {
      query.andWhere('advance.status = :status', { status: filters.status });
    }

    if (filters?.tripId) {
      query.andWhere('advance.tripId = :tripId', { tripId: filters.tripId });
    }

    query.orderBy('advance.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Advance> {
    const advance = await this.advanceRepository.findOne({
      where: { id },
      relations: ['employee', 'approver', 'trip'],
    });

    if (!advance) {
      throw new NotFoundException(`Advance with ID ${id} not found`);
    }

    return advance;
  }

  async approve(id: string, approverId: string): Promise<Advance> {
    const advance = await this.findOne(id);

    if (advance.status !== AdvanceStatus.PENDING) {
      throw new BadRequestException('Only pending advances can be approved');
    }

    advance.status = AdvanceStatus.APPROVED;
    advance.approvedBy = approverId;
    advance.approvedAt = new Date();

    return await this.advanceRepository.save(advance);
  }

  async reject(id: string, approverId: string, reason: string): Promise<Advance> {
    const advance = await this.findOne(id);

    if (advance.status !== AdvanceStatus.PENDING) {
      throw new BadRequestException('Only pending advances can be rejected');
    }

    advance.status = AdvanceStatus.REJECTED;
    advance.approvedBy = approverId;
    advance.approvedAt = new Date();
    advance.rejectionReason = reason;

    return await this.advanceRepository.save(advance);
  }

  async markAsPaid(id: string): Promise<Advance> {
    const advance = await this.findOne(id);

    if (advance.status !== AdvanceStatus.APPROVED) {
      throw new BadRequestException('Only approved advances can be marked as paid');
    }

    advance.status = AdvanceStatus.PAID;
    advance.paidAt = new Date();

    return await this.advanceRepository.save(advance);
  }

  async settle(id: string, settledAmount: number): Promise<Advance> {
    const advance = await this.findOne(id);

    if (advance.status !== AdvanceStatus.PAID) {
      throw new BadRequestException('Only paid advances can be settled');
    }

    advance.status = AdvanceStatus.SETTLED;
    advance.settledAmount = settledAmount;
    advance.settledAt = new Date();

    return await this.advanceRepository.save(advance);
  }

  async getStatistics(filters?: { employeeId?: string }): Promise<any> {
    const query = this.advanceRepository.createQueryBuilder('advance');

    if (filters?.employeeId) {
      query.where('advance.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    const [
      total,
      pending,
      approved,
      rejected,
      paid,
      settled,
      unreported,
    ] = await Promise.all([
      query.getCount(),
      query.clone().andWhere('advance.status = :status', { status: AdvanceStatus.PENDING }).getCount(),
      query.clone().andWhere('advance.status = :status', { status: AdvanceStatus.APPROVED }).getCount(),
      query.clone().andWhere('advance.status = :status', { status: AdvanceStatus.REJECTED }).getCount(),
      query.clone().andWhere('advance.status = :status', { status: AdvanceStatus.PAID }).getCount(),
      query.clone().andWhere('advance.status = :status', { status: AdvanceStatus.SETTLED }).getCount(),
      query.clone().andWhere('advance.status = :status', { status: AdvanceStatus.UNREPORTED }).getCount(),
    ]);

    const totalAmount = await query.clone()
      .select('SUM(advance.amount)', 'sum')
      .getRawOne();

    const unreportedAmount = await query.clone()
      .andWhere('advance.status = :status', { status: AdvanceStatus.UNREPORTED })
      .select('SUM(advance.amount)', 'sum')
      .getRawOne();

    return {
      total,
      byStatus: {
        pending,
        approved,
        rejected,
        paid,
        settled,
        unreported,
      },
      totalAmount: parseFloat(totalAmount?.sum || '0'),
      unreportedAmount: parseFloat(unreportedAmount?.sum || '0'),
    };
  }

  async remove(id: string): Promise<void> {
    const advance = await this.findOne(id);
    
    if (advance.status !== AdvanceStatus.PENDING && advance.status !== AdvanceStatus.REJECTED) {
      throw new BadRequestException('Only pending or rejected advances can be deleted');
    }

    await this.advanceRepository.remove(advance);
  }
}
