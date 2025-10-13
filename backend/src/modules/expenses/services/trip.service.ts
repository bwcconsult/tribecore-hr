import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from '../entities/trip.entity';
import { CreateTripDto } from '../dto/create-trip.dto';
import { UpdateTripDto } from '../dto/update-trip.dto';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async create(createTripDto: CreateTripDto): Promise<Trip> {
    const tripNumber = `TRIP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const trip = this.tripRepository.create({
      ...createTripDto,
      tripNumber,
      status: TripStatus.DRAFT,
    });

    return this.tripRepository.save(trip);
  }

  async findAll(organizationId: string, filters?: any): Promise<{ data: Trip[]; total: number }> {
    const query = this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.employee', 'employee')
      .where('trip.organizationId = :organizationId', { organizationId });

    if (filters?.status) {
      query.andWhere('trip.status = :status', { status: filters.status });
    }

    if (filters?.employeeId) {
      query.andWhere('trip.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters?.tripType) {
      query.andWhere('trip.tripType = :tripType', { tripType: filters.tripType });
    }

    if (filters?.search) {
      query.andWhere(
        '(trip.tripName ILIKE :search OR trip.tripNumber ILIKE :search OR trip.businessPurpose ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    query.orderBy('trip.createdAt', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }
    if (filters?.page && filters?.limit) {
      query.skip((filters.page - 1) * filters.limit);
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ['employee', 'expenseClaims'],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async findByEmployee(employeeId: string, filters?: any): Promise<{ data: Trip[]; total: number }> {
    const query = this.tripRepository
      .createQueryBuilder('trip')
      .where('trip.employeeId = :employeeId', { employeeId });

    if (filters?.status) {
      query.andWhere('trip.status = :status', { status: filters.status });
    }

    query.orderBy('trip.startDate', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }
    if (filters?.page && filters?.limit) {
      query.skip((filters.page - 1) * filters.limit);
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async update(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    const trip = await this.findOne(id);

    // Validate status transitions
    if (updateTripDto.status) {
      this.validateStatusTransition(trip.status, updateTripDto.status);
    }

    Object.assign(trip, updateTripDto);
    return this.tripRepository.save(trip);
  }

  async submit(id: string, submittedBy: string): Promise<Trip> {
    const trip = await this.findOne(id);

    if (trip.status !== TripStatus.DRAFT) {
      throw new BadRequestException('Only draft trips can be submitted');
    }

    trip.status = TripStatus.SUBMITTED;
    trip.submittedBy = submittedBy;
    trip.submittedAt = new Date();

    return this.tripRepository.save(trip);
  }

  async approve(id: string, approvedBy: string): Promise<Trip> {
    const trip = await this.findOne(id);

    if (trip.status !== TripStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted trips can be approved');
    }

    trip.status = TripStatus.APPROVED;
    trip.approvedBy = approvedBy;
    trip.approvedAt = new Date();

    return this.tripRepository.save(trip);
  }

  async reject(id: string, approvedBy: string, reason: string): Promise<Trip> {
    const trip = await this.findOne(id);

    if (trip.status !== TripStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted trips can be rejected');
    }

    trip.status = TripStatus.REJECTED;
    trip.approvedBy = approvedBy;
    trip.approvedAt = new Date();
    trip.rejectionReason = reason;

    return this.tripRepository.save(trip);
  }

  async markAsInProgress(id: string): Promise<Trip> {
    const trip = await this.findOne(id);

    if (trip.status !== TripStatus.APPROVED) {
      throw new BadRequestException('Only approved trips can be marked as in progress');
    }

    trip.status = TripStatus.IN_PROGRESS;
    return this.tripRepository.save(trip);
  }

  async markAsCompleted(id: string, actualCost?: number): Promise<Trip> {
    const trip = await this.findOne(id);

    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress trips can be marked as completed');
    }

    trip.status = TripStatus.COMPLETED;
    if (actualCost !== undefined) {
      trip.actualCost = actualCost;
    }

    return this.tripRepository.save(trip);
  }

  async cancel(id: string, reason: string): Promise<Trip> {
    const trip = await this.findOne(id);

    trip.status = TripStatus.CANCELLED;
    trip.rejectionReason = reason;

    return this.tripRepository.save(trip);
  }

  async delete(id: string): Promise<void> {
    const trip = await this.findOne(id);

    if (trip.status !== TripStatus.DRAFT && trip.status !== TripStatus.CANCELLED) {
      throw new BadRequestException('Only draft or cancelled trips can be deleted');
    }

    await this.tripRepository.remove(trip);
  }

  async getStatistics(organizationId: string): Promise<any> {
    const trips = await this.tripRepository.find({ where: { organizationId } });

    return {
      total: trips.length,
      byStatus: {
        draft: trips.filter(t => t.status === TripStatus.DRAFT).length,
        submitted: trips.filter(t => t.status === TripStatus.SUBMITTED).length,
        approved: trips.filter(t => t.status === TripStatus.APPROVED).length,
        inProgress: trips.filter(t => t.status === TripStatus.IN_PROGRESS).length,
        completed: trips.filter(t => t.status === TripStatus.COMPLETED).length,
        rejected: trips.filter(t => t.status === TripStatus.REJECTED).length,
        cancelled: trips.filter(t => t.status === TripStatus.CANCELLED).length,
      },
      byType: {
        domestic: trips.filter(t => t.tripType === 'DOMESTIC').length,
        international: trips.filter(t => t.tripType === 'INTERNATIONAL').length,
      },
      totalEstimatedCost: trips
        .filter(t => t.estimatedCost)
        .reduce((sum, t) => sum + Number(t.estimatedCost), 0),
      totalActualCost: trips
        .filter(t => t.actualCost)
        .reduce((sum, t) => sum + Number(t.actualCost), 0),
    };
  }

  private validateStatusTransition(currentStatus: TripStatus, newStatus: TripStatus): void {
    const validTransitions: Record<TripStatus, TripStatus[]> = {
      [TripStatus.DRAFT]: [TripStatus.SUBMITTED, TripStatus.CANCELLED],
      [TripStatus.SUBMITTED]: [TripStatus.APPROVED, TripStatus.REJECTED, TripStatus.DRAFT],
      [TripStatus.APPROVED]: [TripStatus.IN_PROGRESS, TripStatus.CANCELLED],
      [TripStatus.REJECTED]: [TripStatus.DRAFT],
      [TripStatus.IN_PROGRESS]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
      [TripStatus.COMPLETED]: [],
      [TripStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
