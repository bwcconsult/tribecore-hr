import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mileage, MileageStatus } from '../entities/mileage.entity';
import { CreateMileageDto } from '../dto/create-mileage.dto';

@Injectable()
export class MileageService {
  constructor(
    @InjectRepository(Mileage)
    private mileageRepository: Repository<Mileage>,
  ) {}

  async create(createMileageDto: CreateMileageDto): Promise<Mileage> {
    const mileageNumber = `MIL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // Calculate total amount
    const totalAmount = createMileageDto.distance * createMileageDto.ratePerUnit;

    const mileage = this.mileageRepository.create({
      ...createMileageDto,
      mileageNumber,
      totalAmount,
      status: MileageStatus.DRAFT,
      currency: createMileageDto.currency || 'GBP',
      distanceUnit: createMileageDto.distanceUnit || 'miles',
    });

    return this.mileageRepository.save(mileage);
  }

  async findAll(organizationId: string, filters?: any): Promise<{ data: Mileage[]; total: number }> {
    const query = this.mileageRepository
      .createQueryBuilder('mileage')
      .leftJoinAndSelect('mileage.employee', 'employee')
      .where('mileage.organizationId = :organizationId', { organizationId });

    if (filters?.status) {
      query.andWhere('mileage.status = :status', { status: filters.status });
    }

    if (filters?.employeeId) {
      query.andWhere('mileage.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters?.vehicleType) {
      query.andWhere('mileage.vehicleType = :vehicleType', { vehicleType: filters.vehicleType });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('mileage.travelDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    query.orderBy('mileage.travelDate', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }
    if (filters?.page && filters?.limit) {
      query.skip((filters.page - 1) * filters.limit);
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Mileage> {
    const mileage = await this.mileageRepository.findOne({
      where: { id },
      relations: ['employee', 'expenseClaim'],
    });

    if (!mileage) {
      throw new NotFoundException(`Mileage claim with ID ${id} not found`);
    }

    return mileage;
  }

  async findByEmployee(employeeId: string, filters?: any): Promise<{ data: Mileage[]; total: number }> {
    const query = this.mileageRepository
      .createQueryBuilder('mileage')
      .where('mileage.employeeId = :employeeId', { employeeId });

    if (filters?.status) {
      query.andWhere('mileage.status = :status', { status: filters.status });
    }

    query.orderBy('mileage.travelDate', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }
    if (filters?.page && filters?.limit) {
      query.skip((filters.page - 1) * filters.limit);
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async update(id: string, updateData: Partial<CreateMileageDto>): Promise<Mileage> {
    const mileage = await this.findOne(id);

    Object.assign(mileage, updateData);

    // Recalculate total if distance or rate changed
    if (updateData.distance || updateData.ratePerUnit) {
      mileage.totalAmount = mileage.distance * mileage.ratePerUnit;
    }

    return this.mileageRepository.save(mileage);
  }

  async submit(id: string): Promise<Mileage> {
    const mileage = await this.findOne(id);

    if (mileage.status !== MileageStatus.DRAFT) {
      throw new BadRequestException('Only draft mileage claims can be submitted');
    }

    mileage.status = MileageStatus.SUBMITTED;
    return this.mileageRepository.save(mileage);
  }

  async approve(id: string, approvedBy: string): Promise<Mileage> {
    const mileage = await this.findOne(id);

    if (mileage.status !== MileageStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted mileage claims can be approved');
    }

    mileage.status = MileageStatus.APPROVED;
    mileage.approvedBy = approvedBy;
    mileage.approvedAt = new Date();

    return this.mileageRepository.save(mileage);
  }

  async reject(id: string, approvedBy: string, reason: string): Promise<Mileage> {
    const mileage = await this.findOne(id);

    if (mileage.status !== MileageStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted mileage claims can be rejected');
    }

    mileage.status = MileageStatus.REJECTED;
    mileage.approvedBy = approvedBy;
    mileage.approvedAt = new Date();
    mileage.rejectionReason = reason;

    return this.mileageRepository.save(mileage);
  }

  async markAsPaid(id: string): Promise<Mileage> {
    const mileage = await this.findOne(id);

    if (mileage.status !== MileageStatus.APPROVED) {
      throw new BadRequestException('Only approved mileage claims can be marked as paid');
    }

    mileage.status = MileageStatus.PAID;
    return this.mileageRepository.save(mileage);
  }

  async delete(id: string): Promise<void> {
    const mileage = await this.findOne(id);

    if (mileage.status !== MileageStatus.DRAFT) {
      throw new BadRequestException('Only draft mileage claims can be deleted');
    }

    await this.mileageRepository.remove(mileage);
  }

  async getStatistics(organizationId: string): Promise<any> {
    const mileageClaims = await this.mileageRepository.find({ where: { organizationId } });

    return {
      total: mileageClaims.length,
      byStatus: {
        draft: mileageClaims.filter(m => m.status === MileageStatus.DRAFT).length,
        submitted: mileageClaims.filter(m => m.status === MileageStatus.SUBMITTED).length,
        approved: mileageClaims.filter(m => m.status === MileageStatus.APPROVED).length,
        rejected: mileageClaims.filter(m => m.status === MileageStatus.REJECTED).length,
        paid: mileageClaims.filter(m => m.status === MileageStatus.PAID).length,
      },
      byVehicleType: {
        car: mileageClaims.filter(m => m.vehicleType === 'CAR').length,
        motorcycle: mileageClaims.filter(m => m.vehicleType === 'MOTORCYCLE').length,
        bicycle: mileageClaims.filter(m => m.vehicleType === 'BICYCLE').length,
        van: mileageClaims.filter(m => m.vehicleType === 'VAN').length,
      },
      totalDistance: mileageClaims.reduce((sum, m) => sum + Number(m.distance), 0),
      totalAmount: mileageClaims
        .filter(m => m.status === MileageStatus.APPROVED || m.status === MileageStatus.PAID)
        .reduce((sum, m) => sum + Number(m.totalAmount), 0),
    };
  }

  async calculateMileageRate(vehicleType: string, distance: number): Promise<number> {
    // UK HMRC rates (2024/25)
    const rates: Record<string, { firstMiles: number; firstRate: number; subsequentRate: number }> = {
      CAR: { firstMiles: 10000, firstRate: 0.45, subsequentRate: 0.25 },
      MOTORCYCLE: { firstMiles: 0, firstRate: 0.24, subsequentRate: 0.24 },
      BICYCLE: { firstMiles: 0, firstRate: 0.20, subsequentRate: 0.20 },
      VAN: { firstMiles: 10000, firstRate: 0.45, subsequentRate: 0.25 },
    };

    const vehicleRate = rates[vehicleType] || rates.CAR;

    if (distance <= vehicleRate.firstMiles || vehicleRate.firstMiles === 0) {
      return vehicleRate.firstRate;
    }

    return vehicleRate.subsequentRate;
  }
}
