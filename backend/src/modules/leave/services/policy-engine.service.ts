import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from '../entities/leave-type.entity';
import { WorkingPattern } from '../entities/working-pattern.entity';
import { PublicHoliday } from '../entities/public-holiday.entity';
import { EmbargoWindow } from '../entities/embargo-window.entity';

/**
 * PolicyEngineService
 * Loads and applies leave policies
 * Provides pre-built templates for multi-country compliance
 */
@Injectable()
export class PolicyEngineService {
  private readonly logger = new Logger(PolicyEngineService.name);

  constructor(
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(WorkingPattern)
    private workingPatternRepo: Repository<WorkingPattern>,
    @InjectRepository(PublicHoliday)
    private publicHolidayRepo: Repository<PublicHoliday>,
    @InjectRepository(EmbargoWindow)
    private embargoRepo: Repository<EmbargoWindow>,
  ) {}

  /**
   * Get leave type policy
   */
  async getLeaveType(organizationId: string, code: string): Promise<LeaveType | null> {
    return this.leaveTypeRepo.findOne({
      where: { organizationId, code, isActive: true },
    });
  }

  /**
   * Get all active leave types for organization
   */
  async getLeaveTypes(organizationId: string): Promise<LeaveType[]> {
    return this.leaveTypeRepo.find({
      where: { organizationId, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get working pattern
   */
  async getWorkingPattern(id: string): Promise<WorkingPattern | null> {
    return this.workingPatternRepo.findOne({
      where: { id, isActive: true },
    });
  }

  /**
   * Get public holidays for date range
   */
  async getPublicHolidays(
    organizationId: string,
    country: string,
    state: string | null,
    startDate: Date,
    endDate: Date,
  ): Promise<PublicHoliday[]> {
    const query = this.publicHolidayRepo
      .createQueryBuilder('ph')
      .where('ph.organizationId = :organizationId', { organizationId })
      .andWhere('ph.country = :country', { country })
      .andWhere('ph.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('ph.isActive = true');

    if (state) {
      query.andWhere('(ph.state = :state OR ph.state IS NULL)', { state });
    }

    return query.orderBy('ph.date', 'ASC').getMany();
  }

  /**
   * Check embargo/blackout periods
   */
  async checkEmbargoes(
    organizationId: string,
    employeeId: string,
    leaveTypeCode: string,
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    locationId?: string,
  ): Promise<EmbargoWindow[]> {
    const embargoes = await this.embargoRepo
      .createQueryBuilder('e')
      .where('e.organizationId = :organizationId', { organizationId })
      .andWhere('e.isActive = true')
      .andWhere('e.status = :status', { status: 'ACTIVE' })
      .andWhere(
        '(e.startDate <= :endDate AND e.endDate >= :startDate)',
        { startDate, endDate },
      )
      .getMany();

    // Filter by leave type
    const filtered = embargoes.filter(e =>
      e.affectedLeaveTypes.includes(leaveTypeCode) || e.affectedLeaveTypes.includes('ALL'),
    );

    // Filter by scope
    return filtered.filter(e => {
      if (e.scope.type === 'ALL') return true;
      if (e.scope.employeeIds?.includes(employeeId)) return true;
      if (departmentId && e.scope.departmentIds?.includes(departmentId)) return true;
      if (locationId && e.scope.locationIds?.includes(locationId)) return true;
      return false;
    });
  }

  /**
   * Initialize default leave types for organization
   */
  async initializeDefaultLeaveTypes(
    organizationId: string,
    country: string,
    preset: 'UK_STANDARD' | 'US_FMLA' | 'SA_BCEA' | 'NG_LABOUR' | 'NHS_AFC',
  ): Promise<LeaveType[]> {
    let templates: Partial<LeaveType>[] = [];

    switch (preset) {
      case 'UK_STANDARD':
        templates = this.getUKStandardTemplates(organizationId);
        break;
      case 'US_FMLA':
        templates = this.getUSFMLATemplates(organizationId);
        break;
      case 'SA_BCEA':
        templates = this.getSABCEATemplates(organizationId);
        break;
      case 'NG_LABOUR':
        templates = this.getNigeriaTemplates(organizationId);
        break;
      case 'NHS_AFC':
        templates = this.getNHSTemplates(organizationId);
        break;
    }

    const created: LeaveType[] = [];
    for (const template of templates) {
      const existing = await this.leaveTypeRepo.findOne({
        where: { organizationId, code: template.code as string },
      });

      if (!existing) {
        const leaveType = this.leaveTypeRepo.create(template);
        const saved = await this.leaveTypeRepo.save(leaveType);
        created.push(saved);
      }
    }

    this.logger.log(`Initialized ${created.length} leave types for ${preset}`);
    return created;
  }

  /**
   * UK Standard (Working Time Directive compliant)
   */
  private getUKStandardTemplates(organizationId: string): Partial<LeaveType>[] {
    return [
      {
        organizationId,
        code: 'AL',
        name: 'Annual Leave',
        description: 'Statutory annual leave (WTD compliant)',
        unit: 'HOURS',
        color: '#4CAF50',
        icon: 'calendar',
        entitlement: {
          fullTimeHoursPerYear: 224, // 28 days * 8 hours (5.6 weeks)
        },
        accrual: {
          method: 'MONTHLY_PRORATA',
          rounding: 'NEAREST_0_5H',
        },
        proRataOnJoin: true,
        carryover: {
          enabled: true,
          maxHours: 40, // 5 days
          expiresOn: '04-01', // April 1st
        },
        purchaseSell: {
          purchaseEnabled: true,
          sellEnabled: true,
          purchaseMaxHours: 40,
          sellMaxHours: 24,
          window: { start: '09-01', end: '10-31' },
          minBalanceAfterSell: 224, // Can't sell below statutory
        },
        requiresApproval: true,
        minNoticeDays: 7,
        minBlockHours: 1,
        deductPublicHolidays: true,
        compliance: {
          statutory: true,
          jurisdiction: 'UK_WTD',
          legislationRef: 'Working Time Regulations 1998',
          minEntitlement: 224,
        },
        payrollCode: 'AL',
        sortOrder: 1,
      },
      {
        organizationId,
        code: 'SICK',
        name: 'Sickness',
        description: 'Statutory sick pay',
        unit: 'HOURS',
        color: '#F44336',
        icon: 'heart-pulse',
        entitlement: {
          unlimitedBalance: true,
        },
        accrual: {
          method: 'NONE',
        },
        paidStages: [
          { days: 7, payRate: 1.0 }, // Full pay 1 week
          { days: 21, payRate: 0.5 }, // Half pay 3 weeks
        ],
        selfCertDays: 7,
        fitNoteRequiredAfterDays: 7,
        requiresApproval: false,
        minNoticeDays: 0,
        deductPublicHolidays: false,
        compliance: {
          statutory: true,
          jurisdiction: 'UK_SSP',
          legislationRef: 'Statutory Sick Pay (General) Regulations 1982',
        },
        payrollCode: 'SICK',
        sortOrder: 2,
      },
      {
        organizationId,
        code: 'TOIL',
        name: 'Time Off In Lieu',
        description: 'Time off for overtime worked',
        unit: 'HOURS',
        color: '#9C27B0',
        icon: 'clock',
        entitlement: {},
        accrual: {
          method: 'NONE',
        },
        balanceSource: 'OVERTIME',
        expiryDays: 90,
        conversionRate: 1.0,
        requiresApproval: true,
        minNoticeDays: 2,
        payrollCode: 'TOIL',
        sortOrder: 3,
      },
    ];
  }

  /**
   * US FMLA (Family & Medical Leave Act)
   */
  private getUSFMLATemplates(organizationId: string): Partial<LeaveType>[] {
    return [
      {
        organizationId,
        code: 'PTO',
        name: 'Paid Time Off',
        description: 'Combined vacation/sick days',
        unit: 'HOURS',
        color: '#2196F3',
        entitlement: {
          fullTimeHoursPerYear: 160, // 20 days
        },
        accrual: {
          method: 'MONTHLY_PRORATA',
          rounding: 'NEAREST_1H',
        },
        carryover: {
          enabled: true,
          maxHours: 80,
          expiryDays: 90,
        },
        requiresApproval: true,
        minNoticeDays: 14,
        payrollCode: 'PTO',
        sortOrder: 1,
      },
      {
        organizationId,
        code: 'FMLA',
        name: 'FMLA Leave',
        description: 'Family & Medical Leave Act',
        unit: 'WEEKS',
        color: '#FF9800',
        entitlement: {
          staticAmount: 12, // 12 weeks per rolling year
        },
        accrual: {
          method: 'ANNIVERSARY',
        },
        requiresApproval: true,
        minNoticeDays: 30,
        documentation: {
          required: true,
          types: ['MEDICAL_CERT', 'BIRTH_CERT'],
        },
        compliance: {
          statutory: true,
          jurisdiction: 'US_FMLA',
          legislationRef: 'Family and Medical Leave Act of 1993',
          jobProtected: true,
        },
        payrollCode: 'FMLA_UNPAID',
        affectsPayroll: false,
        sortOrder: 2,
      },
    ];
  }

  /**
   * South Africa BCEA
   */
  private getSABCEATemplates(organizationId: string): Partial<LeaveType>[] {
    return [
      {
        organizationId,
        code: 'AL',
        name: 'Annual Leave',
        description: 'BCEA compliant annual leave',
        unit: 'DAYS',
        color: '#4CAF50',
        entitlement: {
          fullTimeDaysPerYear: 21, // 21 consecutive days
        },
        accrual: {
          method: 'MONTHLY_PRORATA',
          rounding: 'NEAREST_0_5H',
        },
        carryover: {
          enabled: false, // BCEA requires use or forfeit
        },
        requiresApproval: true,
        minNoticeDays: 14,
        compliance: {
          statutory: true,
          jurisdiction: 'SA_BCEA',
          legislationRef: 'Basic Conditions of Employment Act 75 of 1997',
          minEntitlement: 21,
        },
        payrollCode: 'AL',
        sortOrder: 1,
      },
    ];
  }

  /**
   * Nigeria Labour Act
   */
  private getNigeriaTemplates(organizationId: string): Partial<LeaveType>[] {
    return [
      {
        organizationId,
        code: 'AL',
        name: 'Annual Leave',
        description: 'Nigerian Labour Act compliant',
        unit: 'DAYS',
        color: '#4CAF50',
        entitlement: {
          fullTimeDaysPerYear: 6, // Minimum 6 days after 1 year
        },
        accrual: {
          method: 'ANNIVERSARY',
        },
        requiresApproval: true,
        minNoticeDays: 7,
        compliance: {
          statutory: true,
          jurisdiction: 'NG_LABOUR',
          legislationRef: 'Nigerian Labour Act',
          minEntitlement: 6,
        },
        payrollCode: 'AL',
        sortOrder: 1,
      },
    ];
  }

  /**
   * NHS Agenda for Change
   */
  private getNHSTemplates(organizationId: string): Partial<LeaveType>[] {
    return [
      {
        organizationId,
        code: 'AL',
        name: 'Annual Leave',
        description: 'NHS AfC annual leave (increases with service)',
        unit: 'HOURS',
        color: '#0078D4',
        entitlement: {
          fullTimeHoursPerYear: 216, // 27 days for <5 years service
        },
        accrual: {
          method: 'MONTHLY_PRORATA',
          rounding: 'NEAREST_0_5H',
        },
        carryover: {
          enabled: true,
          maxHours: 40,
          expiresOn: '03-31',
          requiresApproval: true,
        },
        requiresApproval: true,
        minNoticeDays: 14,
        compliance: {
          statutory: true,
          jurisdiction: 'NHS_AFC',
          legislationRef: 'NHS Terms and Conditions of Service Handbook',
        },
        payrollCode: 'AL',
        sortOrder: 1,
      },
      {
        organizationId,
        code: 'STUDY',
        name: 'Study Leave',
        description: 'Professional development leave',
        unit: 'DAYS',
        color: '#673AB7',
        entitlement: {
          staticAmount: 30, // 30 days over 3 years
        },
        requiresApproval: true,
        minNoticeDays: 28,
        documentation: {
          required: true,
          types: ['COURSE_DETAILS'],
        },
        payrollCode: 'STUDY',
        sortOrder: 5,
      },
    ];
  }

  /**
   * Create standard working patterns
   */
  async createStandardWorkingPatterns(organizationId: string): Promise<WorkingPattern[]> {
    const patterns: Partial<WorkingPattern>[] = [
      {
        organizationId,
        name: 'Full-Time Mon-Fri',
        description: 'Standard 5-day week, 37.5 hours',
        cycleDays: 7,
        ftePercentage: 1.0,
        weeklyContractedHours: 37.5,
        defaultDailyHours: 7.5,
        pattern: [
          { dayOfCycle: 0, dayOfWeek: 'MON', isWorkingDay: true, hoursScheduled: 7.5, startTime: '09:00', endTime: '17:00' },
          { dayOfCycle: 1, dayOfWeek: 'TUE', isWorkingDay: true, hoursScheduled: 7.5, startTime: '09:00', endTime: '17:00' },
          { dayOfCycle: 2, dayOfWeek: 'WED', isWorkingDay: true, hoursScheduled: 7.5, startTime: '09:00', endTime: '17:00' },
          { dayOfCycle: 3, dayOfWeek: 'THU', isWorkingDay: true, hoursScheduled: 7.5, startTime: '09:00', endTime: '17:00' },
          { dayOfCycle: 4, dayOfWeek: 'FRI', isWorkingDay: true, hoursScheduled: 7.5, startTime: '09:00', endTime: '17:00' },
          { dayOfCycle: 5, dayOfWeek: 'SAT', isWorkingDay: false, hoursScheduled: 0 },
          { dayOfCycle: 6, dayOfWeek: 'SUN', isWorkingDay: false, hoursScheduled: 0 },
        ],
        publicHolidayHandling: 'DEDUCT',
        metadata: { sector: 'OFFICE' },
      },
      {
        organizationId,
        name: 'Part-Time 60% (3 days)',
        description: '3 days per week, 22.5 hours',
        cycleDays: 7,
        ftePercentage: 0.6,
        weeklyContractedHours: 22.5,
        defaultDailyHours: 7.5,
        pattern: [
          { dayOfCycle: 0, dayOfWeek: 'MON', isWorkingDay: true, hoursScheduled: 7.5, startTime: '09:00', endTime: '17:00' },
          { dayOfCycle: 1, dayOfWeek: 'TUE', isWorkingDay: true, hoursScheduled: 7.5, startTime: '09:00', endTime: '17:00' },
          { dayOfCycle: 2, dayOfWeek: 'WED', isWorkingDay: true, hoursScheduled: 7.5, startTime: '09:00', endTime: '17:00' },
          { dayOfCycle: 3, dayOfWeek: 'THU', isWorkingDay: false, hoursScheduled: 0 },
          { dayOfCycle: 4, dayOfWeek: 'FRI', isWorkingDay: false, hoursScheduled: 0 },
          { dayOfCycle: 5, dayOfWeek: 'SAT', isWorkingDay: false, hoursScheduled: 0 },
          { dayOfCycle: 6, dayOfWeek: 'SUN', isWorkingDay: false, hoursScheduled: 0 },
        ],
        publicHolidayHandling: 'DEDUCT',
      },
      {
        organizationId,
        name: '4-on-4-off (12h shifts)',
        description: '12-hour shifts, 4 days on, 4 days off',
        cycleDays: 8,
        ftePercentage: 1.0,
        weeklyContractedHours: 42,
        defaultDailyHours: 12,
        isShiftPattern: true,
        includesNights: true,
        includesWeekends: true,
        pattern: [
          { dayOfCycle: 0, dayOfWeek: 'MON', isWorkingDay: true, hoursScheduled: 12, startTime: '07:00', endTime: '19:00' },
          { dayOfCycle: 1, dayOfWeek: 'TUE', isWorkingDay: true, hoursScheduled: 12, startTime: '07:00', endTime: '19:00' },
          { dayOfCycle: 2, dayOfWeek: 'WED', isWorkingDay: true, hoursScheduled: 12, startTime: '07:00', endTime: '19:00' },
          { dayOfCycle: 3, dayOfWeek: 'THU', isWorkingDay: true, hoursScheduled: 12, startTime: '07:00', endTime: '19:00' },
          { dayOfCycle: 4, dayOfWeek: 'FRI', isWorkingDay: false, hoursScheduled: 0 },
          { dayOfCycle: 5, dayOfWeek: 'SAT', isWorkingDay: false, hoursScheduled: 0 },
          { dayOfCycle: 6, dayOfWeek: 'SUN', isWorkingDay: false, hoursScheduled: 0 },
          { dayOfCycle: 7, dayOfWeek: 'MON', isWorkingDay: false, hoursScheduled: 0 },
        ],
        publicHolidayHandling: 'GRANT_IN_LIEU',
        metadata: { sector: 'HEALTHCARE', rotaType: 'CONTINENTAL' },
      },
    ];

    const created: WorkingPattern[] = [];
    for (const pattern of patterns) {
      const existing = await this.workingPatternRepo.findOne({
        where: { organizationId, name: pattern.name as string },
      });

      if (!existing) {
        const wp = this.workingPatternRepo.create(pattern);
        const saved = await this.workingPatternRepo.save(wp);
        created.push(saved);
      }
    }

    return created;
  }
}
