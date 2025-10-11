import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AbsencePlan } from './entities/absence-plan.entity';
import { AbsenceRequest, AbsenceRequestStatus } from './entities/absence-request.entity';
import { AbsenceBalance } from './entities/absence-balance.entity';
import { SicknessEpisode } from './entities/sickness-episode.entity';
import { CreateAbsenceRequestDto, ApproveAbsenceRequestDto, RejectAbsenceRequestDto } from './dto/create-absence-request.dto';
import { CreateSicknessEpisodeDto, UpdateSicknessEpisodeDto } from './dto/create-sickness-episode.dto';

@Injectable()
export class AbsenceService {
  constructor(
    @InjectRepository(AbsencePlan)
    private planRepository: Repository<AbsencePlan>,
    @InjectRepository(AbsenceRequest)
    private requestRepository: Repository<AbsenceRequest>,
    @InjectRepository(AbsenceBalance)
    private balanceRepository: Repository<AbsenceBalance>,
    @InjectRepository(SicknessEpisode)
    private sicknessRepository: Repository<SicknessEpisode>,
  ) {}

  /**
   * Get all absence plans (filtered by user role)
   */
  async getPlans(userRole: string): Promise<AbsencePlan[]> {
    return this.planRepository.find({
      where: {
        isActive: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Get absence balance for a user and plan
   */
  async getBalance(userId: string, planId: string, period: string): Promise<AbsenceBalance> {
    let balance = await this.balanceRepository.findOne({
      where: { userId, planId, period },
    });

    if (!balance) {
      // Create initial balance if doesn't exist
      const plan = await this.planRepository.findOne({ where: { id: planId } });
      if (!plan) {
        throw new NotFoundException('Absence plan not found');
      }

      balance = this.balanceRepository.create({
        userId,
        planId,
        period,
        entitlementDays: plan.defaultEntitlementDays || 0,
        accruedDays: 0,
        takenDays: 0,
        scheduledDays: 0,
        pendingDays: 0,
        remainingDays: plan.defaultEntitlementDays || 0,
        availableDays: plan.defaultEntitlementDays || 0,
        carryoverDays: 0,
        episodes: 0,
        fteRatio: 1.0,
        isProRated: false,
        lastCalculatedAt: new Date(),
      });

      balance = await this.balanceRepository.save(balance);
    }

    return balance;
  }

  /**
   * Get all balances for a user
   */
  async getUserBalances(userId: string, period: string): Promise<AbsenceBalance[]> {
    const activePlans = await this.planRepository.find({
      where: { isActive: true },
    });

    const balances = [];
    for (const plan of activePlans) {
      const balance = await this.getBalance(userId, plan.id, period);
      balances.push(balance);
    }

    return balances;
  }

  /**
   * Create absence request
   */
  async createRequest(userId: string, dto: CreateAbsenceRequestDto): Promise<AbsenceRequest> {
    const plan = await this.planRepository.findOne({ where: { id: dto.planId } });
    if (!plan) {
      throw new NotFoundException('Absence plan not found');
    }

    // Calculate working days
    const calculatedDays = this.calculateWorkingDays(dto.startDate, dto.endDate, dto.isPartialDay, dto.hours);

    // Check balance
    const currentYear = new Date().getFullYear().toString();
    const balance = await this.getBalance(userId, dto.planId, currentYear);

    // Detect conflicts
    const conflicts = await this.detectConflicts(userId, dto.startDate, dto.endDate, balance, calculatedDays);

    const request = this.requestRepository.create({
      userId,
      planId: dto.planId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      isPartialDay: dto.isPartialDay || false,
      partialDayType: dto.partialDayType,
      hours: dto.hours,
      calculatedDays,
      status: AbsenceRequestStatus.PENDING,
      reasonCode: dto.reasonCode,
      notes: dto.notes,
      attachmentIds: dto.attachmentIds,
      hasConflicts: conflicts.length > 0,
      conflicts,
      balanceBeforeRequest: balance.remainingDays,
      balanceAfterRequest: balance.remainingDays - calculatedDays,
      submittedAt: new Date(),
      createdByUserId: userId,
    });

    const savedRequest = await this.requestRepository.save(request);

    // Update balance pending days
    balance.pendingDays += calculatedDays;
    balance.availableDays = balance.remainingDays - balance.pendingDays;
    await this.balanceRepository.save(balance);

    return savedRequest;
  }

  /**
   * Approve absence request
   */
  async approveRequest(
    requestId: string,
    approverId: string,
    dto: ApproveAbsenceRequestDto,
  ): Promise<AbsenceRequest> {
    const request = await this.requestRepository.findOne({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Absence request not found');
    }

    if (request.status !== AbsenceRequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    request.status = AbsenceRequestStatus.APPROVED;
    request.approvedAt = new Date();
    request.currentApproverId = approverId;

    const savedRequest = await this.requestRepository.save(request);

    // Update balances
    const currentYear = new Date().getFullYear().toString();
    const balance = await this.getBalance(request.userId, request.planId, currentYear);

    balance.pendingDays -= request.calculatedDays;
    balance.scheduledDays += request.calculatedDays;
    balance.remainingDays -= request.calculatedDays;
    balance.availableDays = balance.remainingDays - balance.pendingDays;
    balance.lastCalculatedAt = new Date();

    await this.balanceRepository.save(balance);

    // TODO: Create calendar event
    // TODO: Send notification

    return savedRequest;
  }

  /**
   * Reject absence request
   */
  async rejectRequest(
    requestId: string,
    approverId: string,
    dto: RejectAbsenceRequestDto,
  ): Promise<AbsenceRequest> {
    const request = await this.requestRepository.findOne({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Absence request not found');
    }

    if (request.status !== AbsenceRequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    request.status = AbsenceRequestStatus.REJECTED;
    request.rejectedAt = new Date();
    request.rejectionReason = dto.reason;
    request.currentApproverId = approverId;

    const savedRequest = await this.requestRepository.save(request);

    // Update balance pending days
    const currentYear = new Date().getFullYear().toString();
    const balance = await this.getBalance(request.userId, request.planId, currentYear);

    balance.pendingDays -= request.calculatedDays;
    balance.availableDays = balance.remainingDays - balance.pendingDays;
    balance.lastCalculatedAt = new Date();

    await this.balanceRepository.save(balance);

    // TODO: Send notification

    return savedRequest;
  }

  /**
   * Cancel absence request
   */
  async cancelRequest(requestId: string, userId: string): Promise<AbsenceRequest> {
    const request = await this.requestRepository.findOne({ where: { id: requestId, userId } });
    if (!request) {
      throw new NotFoundException('Absence request not found');
    }

    if (request.status === AbsenceRequestStatus.CANCELLED) {
      throw new BadRequestException('Request already cancelled');
    }

    const previousStatus = request.status;
    request.status = AbsenceRequestStatus.CANCELLED;
    request.cancelledAt = new Date();

    const savedRequest = await this.requestRepository.save(request);

    // Update balances
    const currentYear = new Date().getFullYear().toString();
    const balance = await this.getBalance(request.userId, request.planId, currentYear);

    if (previousStatus === AbsenceRequestStatus.PENDING) {
      balance.pendingDays -= request.calculatedDays;
    } else if (previousStatus === AbsenceRequestStatus.APPROVED) {
      balance.scheduledDays -= request.calculatedDays;
      balance.remainingDays += request.calculatedDays;
    }

    balance.availableDays = balance.remainingDays - balance.pendingDays;
    balance.lastCalculatedAt = new Date();
    await this.balanceRepository.save(balance);

    return savedRequest;
  }

  /**
   * Calculate working days between two dates
   */
  private calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    isPartialDay?: boolean,
    hours?: number,
  ): number {
    if (hours) {
      // Hour-based calculation (e.g., for TOIL)
      return hours / 7.5; // Assuming 7.5 hour workday
    }

    if (isPartialDay) {
      return 0.5;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      // Exclude weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    // TODO: Exclude public holidays

    return workingDays;
  }

  /**
   * Detect conflicts with existing requests
   */
  private async detectConflicts(
    userId: string,
    startDate: Date,
    endDate: Date,
    balance: AbsenceBalance,
    requestedDays: number,
  ): Promise<any[]> {
    const conflicts = [];

    // Check for overlapping requests
    const overlapping = await this.requestRepository.find({
      where: {
        userId,
        status: In([AbsenceRequestStatus.PENDING, AbsenceRequestStatus.APPROVED]),
        startDate: Between(startDate, endDate),
      },
    });

    if (overlapping.length > 0) {
      conflicts.push({
        type: 'OVERLAP',
        message: 'You have an overlapping absence request',
        canOverride: false,
      });
    }

    // Check balance
    if (requestedDays > balance.availableDays) {
      conflicts.push({
        type: 'EXCEEDS_BALANCE',
        message: `Insufficient balance. Available: ${balance.availableDays} days, Requested: ${requestedDays} days`,
        canOverride: true,
      });
    }

    // TODO: Check blackout periods
    // TODO: Check public holidays

    return conflicts;
  }

  /**
   * Create sickness episode
   */
  async createSicknessEpisode(userId: string, dto: CreateSicknessEpisodeDto): Promise<SicknessEpisode> {
    const episode = this.sicknessRepository.create({
      userId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      sicknessType: dto.sicknessType,
      reason: dto.reason,
      symptoms: dto.symptoms,
      isCertified: dto.isCertified || false,
      certificateDate: dto.certificateDate,
      certificateAttachmentIds: dto.certificateAttachmentIds,
      createdByUserId: userId,
    });

    return this.sicknessRepository.save(episode);
  }

  /**
   * Get user's sickness episodes
   */
  async getSicknessEpisodes(userId: string, startDate?: Date, endDate?: Date): Promise<SicknessEpisode[]> {
    const query: any = { userId };

    if (startDate && endDate) {
      query.startDate = Between(startDate, endDate);
    }

    return this.sicknessRepository.find({
      where: query,
      order: { startDate: 'DESC' },
    });
  }
}
