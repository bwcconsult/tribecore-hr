import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { CalendarEvent, CalendarEventType, CalendarEventStatus } from './entities/calendar-event.entity';
import { BankHoliday } from './entities/bank-holiday.entity';
import { AbsenceBalanceCache, AbsencePlanType } from './entities/absence-balance-cache.entity';
import { CalendarQueryDto, CalendarScope, AnnualOverviewDto } from './dto/calendar-query.dto';
import { CreateBankHolidayDto, UpdateBankHolidayDto } from './dto/create-bank-holiday.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly calendarEventRepository: Repository<CalendarEvent>,
    @InjectRepository(BankHoliday)
    private readonly bankHolidayRepository: Repository<BankHoliday>,
    @InjectRepository(AbsenceBalanceCache)
    private readonly balanceCacheRepository: Repository<AbsenceBalanceCache>,
  ) {}

  /**
   * Get calendar events with GDPR-compliant filtering
   * @param query - Query parameters
   * @param currentUser - Current user context
   */
  async getEvents(query: CalendarQueryDto, currentUser: any) {
    const { from, to, scope, types, userIds, region } = query;

    // Determine which users to include based on scope and role
    const allowedUserIds = await this.determineAllowedUsers(
      scope || CalendarScope.SELF,
      currentUser,
    );

    // Build query
    const queryBuilder = this.calendarEventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.user', 'user')
      .where('event.organizationId = :orgId', { orgId: currentUser.organizationId })
      .andWhere('event.startDate <= :to', { to })
      .andWhere('event.endDate >= :from', { from })
      .andWhere('event.status = :status', { status: CalendarEventStatus.APPROVED });

    // Filter by user IDs
    if (userIds && userIds.length > 0) {
      queryBuilder.andWhere('event.userId IN (:...userIds)', { userIds });
    } else if (allowedUserIds.length > 0) {
      queryBuilder.andWhere('event.userId IN (:...allowedUserIds)', { allowedUserIds });
    }

    // Filter by event types
    if (types && types.length > 0) {
      queryBuilder.andWhere('event.type IN (:...types)', { types });
    }

    const events = await queryBuilder
      .orderBy('event.startDate', 'ASC')
      .getMany();

    // Apply GDPR anonymization
    const anonymizedEvents = this.applyGDPRAnonymization(
      events,
      currentUser,
    );

    // Get bank holidays
    const bankHolidays = await this.getBankHolidays(from, to, region || 'UK');

    return {
      events: anonymizedEvents,
      bankHolidays,
    };
  }

  /**
   * Determine which users the current user can see based on scope and role
   * GDPR: Data minimization principle
   */
  private async determineAllowedUsers(
    scope: CalendarScope,
    currentUser: any,
  ): Promise<string[]> {
    const { id, role, organizationId } = currentUser;

    switch (scope) {
      case CalendarScope.SELF:
        return [id];

      case CalendarScope.DIRECT_REPORTS:
        // Managers can see their direct reports
        if (role === 'MANAGER' || role === 'ADMIN' || role === 'HR_MANAGER') {
          // TODO: Fetch direct reports from employee hierarchy
          return []; // Placeholder
        }
        throw new ForbiddenException('You do not have permission to view direct reports');

      case CalendarScope.TEAM:
        // Members of the same team/department
        if (role === 'MANAGER' || role === 'ADMIN' || role === 'HR_MANAGER') {
          // TODO: Fetch team members
          return [];
        }
        throw new ForbiddenException('You do not have permission to view team calendar');

      case CalendarScope.ORGANIZATION:
        // Admin and HR can see organization-wide
        if (role === 'ADMIN' || role === 'HR_MANAGER') {
          // TODO: Fetch all users in organization
          return [];
        }
        throw new ForbiddenException('You do not have permission to view organization calendar');

      case CalendarScope.PEERS:
        // Employees at the same level/department (limited view)
        // TODO: Implement peer detection logic
        return [];

      case CalendarScope.MANAGER:
        // See manager's calendar
        // TODO: Fetch manager ID from employee record
        return [];

      default:
        return [id];
    }
  }

  /**
   * Apply GDPR anonymization rules
   * - Sickness details masked for non-HR
   * - Peer names anonymized for non-managers
   */
  private applyGDPRAnonymization(
    events: CalendarEvent[],
    currentUser: any,
  ): CalendarEvent[] {
    const isHR = currentUser.role === 'HR_MANAGER' || currentUser.role === 'ADMIN';
    const isManager = currentUser.role === 'MANAGER' || isHR;

    return events.map((event) => {
      const isOwnEvent = event.userId === currentUser.id;

      // Clone event to avoid mutating original
      const anonymizedEvent = { ...event };

      // GDPR: Mask sickness details for non-HR
      if (event.type === CalendarEventType.SICKNESS && !isOwnEvent && !isHR) {
        anonymizedEvent.title = 'Sick Leave';
        if (anonymizedEvent.metadata) {
          delete anonymizedEvent.metadata.reason;
          delete anonymizedEvent.metadata.notes;
        }
      }

      // GDPR: Anonymize peer names for non-managers
      if (!isOwnEvent && !isManager && event.anonymize) {
        anonymizedEvent.title = 'Colleague Unavailable';
        if (anonymizedEvent.user) {
          anonymizedEvent.user = {
            ...anonymizedEvent.user,
            firstName: 'Colleague',
            lastName: '',
            email: '',
          } as any;
        }
      }

      return anonymizedEvent;
    });
  }

  /**
   * Get bank holidays for a date range
   */
  async getBankHolidays(from: string, to: string, region: string) {
    return await this.bankHolidayRepository.find({
      where: {
        region,
        date: Between(new Date(from), new Date(to)),
        isActive: true,
      },
      order: {
        date: 'ASC',
      },
    });
  }

  /**
   * Get annual overview for a user
   */
  async getAnnualOverview(dto: AnnualOverviewDto, currentUser: any) {
    const { year, userId } = dto;
    const targetUserId = userId || currentUser.id;

    // GDPR: Check permission to view other user's data
    if (targetUserId !== currentUser.id) {
      const isHR = currentUser.role === 'HR_MANAGER' || currentUser.role === 'ADMIN';
      const isManager = currentUser.role === 'MANAGER';

      if (!isHR && !isManager) {
        throw new ForbiddenException('You do not have permission to view this calendar');
      }
    }

    const from = `${year}-01-01`;
    const to = `${year}-12-31`;

    const events = await this.calendarEventRepository.find({
      where: {
        userId: targetUserId,
        startDate: Between(new Date(from), new Date(to)),
        status: CalendarEventStatus.APPROVED,
      },
      order: {
        startDate: 'ASC',
      },
    });

    const bankHolidays = await this.getBankHolidays(from, to, 'UK');

    return {
      year,
      events,
      bankHolidays,
    };
  }

  /**
   * Get absence balances with rolling window calculation
   */
  async getAbsenceBalances(userId: string, currentUser: any) {
    // GDPR: Check permission
    if (userId !== currentUser.id) {
      const isHR = currentUser.role === 'HR_MANAGER' || currentUser.role === 'ADMIN';
      if (!isHR) {
        throw new ForbiddenException('You do not have permission to view these balances');
      }
    }

    const balances = await this.balanceCacheRepository.find({
      where: {
        userId,
        isValid: true,
      },
      order: {
        planType: 'ASC',
      },
    });

    // If cache is stale, recalculate
    const now = new Date();
    const staleBalances = balances.filter(
      (b) => new Date(b.lastCalculatedAt).getTime() < now.getTime() - 3600000, // 1 hour
    );

    if (staleBalances.length > 0) {
      // TODO: Trigger recalculation job
      // For now, return cached values with a flag
      return balances.map((b) => ({
        ...b,
        isStale: staleBalances.includes(b),
      }));
    }

    return balances;
  }

  // Bank Holiday Management (Admin only)

  async createBankHoliday(dto: CreateBankHolidayDto, currentUser: any) {
    const holiday = this.bankHolidayRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.bankHolidayRepository.save(holiday);
  }

  async updateBankHoliday(id: string, dto: UpdateBankHolidayDto) {
    const holiday = await this.bankHolidayRepository.findOne({ where: { id } });
    if (!holiday) {
      throw new NotFoundException(`Bank holiday with ID ${id} not found`);
    }
    Object.assign(holiday, dto);
    return await this.bankHolidayRepository.save(holiday);
  }

  async deleteBankHoliday(id: string) {
    const holiday = await this.bankHolidayRepository.findOne({ where: { id } });
    if (!holiday) {
      throw new NotFoundException(`Bank holiday with ID ${id} not found`);
    }
    await this.bankHolidayRepository.remove(holiday);
  }

  async getAllBankHolidays(region?: string) {
    const where = region ? { region, isActive: true } : { isActive: true };
    return await this.bankHolidayRepository.find({
      where,
      order: {
        date: 'ASC',
      },
    });
  }
}
