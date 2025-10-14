import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from '../entities/leave-type.entity';
import { WorkingPattern } from '../entities/working-pattern.entity';
import { PublicHoliday } from '../entities/public-holiday.entity';
import { Entitlement } from '../entities/entitlement.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { PolicyEngineService } from '../services/policy-engine.service';

/**
 * HolidayPlannerSeeder
 * Seeds demo data for Holiday Planner
 */
@Injectable()
export class HolidayPlannerSeeder {
  private readonly logger = new Logger(HolidayPlannerSeeder.name);

  constructor(
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(WorkingPattern)
    private workingPatternRepo: Repository<WorkingPattern>,
    @InjectRepository(PublicHoliday)
    private publicHolidayRepo: Repository<PublicHoliday>,
    @InjectRepository(Entitlement)
    private entitlementRepo: Repository<Entitlement>,
    @InjectRepository(LeaveRequest)
    private requestRepo: Repository<LeaveRequest>,
    private policyEngine: PolicyEngineService,
  ) {}

  /**
   * Seed all demo data
   */
  async seedAll(organizationId: string = 'ORG001'): Promise<void> {
    this.logger.log('🌱 Starting Holiday Planner seed...');

    try {
      // 1. Seed leave types (UK preset)
      await this.seedLeaveTypes(organizationId);

      // 2. Seed working patterns
      await this.seedWorkingPatterns(organizationId);

      // 3. Seed public holidays (2025-2026)
      await this.seedPublicHolidays(organizationId);

      // 4. Seed demo employees' entitlements
      await this.seedEntitlements(organizationId);

      // 5. Seed demo leave requests
      await this.seedLeaveRequests(organizationId);

      this.logger.log('✅ Holiday Planner seed completed successfully!');
    } catch (error) {
      this.logger.error('❌ Holiday Planner seed failed:', error);
      throw error;
    }
  }

  /**
   * Seed leave types
   */
  private async seedLeaveTypes(organizationId: string): Promise<void> {
    this.logger.log('Seeding leave types...');

    // Use policy engine to create UK standard types
    const created = await this.policyEngine.initializeDefaultLeaveTypes(
      organizationId,
      'GB',
      'UK_STANDARD',
    );

    this.logger.log(`✅ Created ${created.length} leave types`);
  }

  /**
   * Seed working patterns
   */
  private async seedWorkingPatterns(organizationId: string): Promise<void> {
    this.logger.log('Seeding working patterns...');

    const created = await this.policyEngine.createStandardWorkingPatterns(organizationId);

    this.logger.log(`✅ Created ${created.length} working patterns`);
  }

  /**
   * Seed UK public holidays for 2025-2026
   */
  private async seedPublicHolidays(organizationId: string): Promise<void> {
    this.logger.log('Seeding public holidays...');

    const holidays = [
      // 2025
      { date: '2025-01-01', name: "New Year's Day", type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2025 },
      { date: '2025-04-18', name: 'Good Friday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2025 },
      { date: '2025-04-21', name: 'Easter Monday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2025 },
      { date: '2025-05-05', name: 'Early May Bank Holiday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2025 },
      { date: '2025-05-26', name: 'Spring Bank Holiday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2025 },
      { date: '2025-08-25', name: 'Summer Bank Holiday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2025 },
      { date: '2025-12-25', name: 'Christmas Day', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2025 },
      { date: '2025-12-26', name: 'Boxing Day', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2025 },
      
      // 2026
      { date: '2026-01-01', name: "New Year's Day", type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2026 },
      { date: '2026-04-03', name: 'Good Friday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2026 },
      { date: '2026-04-06', name: 'Easter Monday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2026 },
      { date: '2026-05-04', name: 'Early May Bank Holiday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2026 },
      { date: '2026-05-25', name: 'Spring Bank Holiday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2026 },
      { date: '2026-08-31', name: 'Summer Bank Holiday', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2026 },
      { date: '2026-12-25', name: 'Christmas Day', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2026 },
      { date: '2026-12-28', name: 'Boxing Day (observed)', type: 'BANK_HOLIDAY', country: 'GB', state: 'ENG', year: 2026 },
    ];

    for (const holiday of holidays) {
      const exists = await this.publicHolidayRepo.findOne({
        where: {
          organizationId,
          country: holiday.country,
          state: holiday.state,
          date: new Date(holiday.date),
        },
      });

      if (!exists) {
        await this.publicHolidayRepo.save(
          this.publicHolidayRepo.create({
            organizationId,
            ...holiday,
            date: new Date(holiday.date),
            isActive: true,
            grantsInLieu: true,
          }),
        );
      }
    }

    this.logger.log(`✅ Created ${holidays.length} public holidays`);
  }

  /**
   * Seed demo employees' entitlements
   */
  private async seedEntitlements(organizationId: string): Promise<void> {
    this.logger.log('Seeding employee entitlements...');

    const demoEmployees = [
      { id: 'EMP001', name: 'John Smith', fte: 1.0 },
      { id: 'EMP002', name: 'Sarah Jones', fte: 1.0 },
      { id: 'EMP003', name: 'Mike Brown', fte: 0.8 },
      { id: 'EMP004', name: 'Emily Davis', fte: 1.0 },
      { id: 'EMP005', name: 'David Wilson', fte: 0.6 },
    ];

    const leaveTypes = await this.leaveTypeRepo.find({
      where: { organizationId, isActive: true },
    });

    const currentYear = new Date().getFullYear();
    const periodStart = new Date(currentYear, 0, 1); // Jan 1
    const periodEnd = new Date(currentYear, 11, 31); // Dec 31

    for (const employee of demoEmployees) {
      for (const leaveType of leaveTypes) {
        // Only create entitlements for leave types with entitlements
        if (!leaveType.entitlement?.fullTimeHoursPerYear && !leaveType.entitlement?.staticAmount) {
          continue;
        }

        const exists = await this.entitlementRepo.findOne({
          where: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            organizationId,
          },
        });

        if (!exists) {
          const entitledHours = leaveType.calculateEntitlement(employee.fte);
          const entitledMinutes = entitledHours * 60;

          // Simulate some usage
          const taken = Math.floor(Math.random() * entitledMinutes * 0.4); // 0-40% used
          const pending = Math.floor(Math.random() * entitledMinutes * 0.1); // 0-10% pending
          const carriedOver = leaveType.code === 'AL' ? Math.floor(Math.random() * 40 * 60) : 0; // 0-40h carried

          await this.entitlementRepo.save(
            this.entitlementRepo.create({
              employeeId: employee.id,
              organizationId,
              leaveTypeId: leaveType.id,
              periodStart,
              periodEnd,
              minutesEntitled: entitledMinutes,
              minutesAccrued: entitledMinutes, // Assume full year accrued
              minutesCarriedOver: carriedOver,
              minutesTaken: taken,
              minutesPending: pending,
              minutesAvailable: entitledMinutes + carriedOver - taken - pending,
              ftePercentage: employee.fte,
            }),
          );
        }
      }
    }

    this.logger.log(`✅ Created entitlements for ${demoEmployees.length} employees`);
  }

  /**
   * Seed demo leave requests
   */
  private async seedLeaveRequests(organizationId: string): Promise<void> {
    this.logger.log('Seeding leave requests...');

    const alLeaveType = await this.leaveTypeRepo.findOne({
      where: { organizationId, code: 'AL' },
    });

    if (!alLeaveType) {
      this.logger.warn('AL leave type not found, skipping leave requests');
      return;
    }

    const demoRequests = [
      {
        employeeId: 'EMP001',
        startDate: new Date(2025, 9, 20), // Oct 20, 2025
        endDate: new Date(2025, 9, 24),   // Oct 24, 2025
        reason: 'Family holiday',
        status: 'APPROVED' as const,
      },
      {
        employeeId: 'EMP002',
        startDate: new Date(2025, 10, 10), // Nov 10, 2025
        endDate: new Date(2025, 10, 14),   // Nov 14, 2025
        reason: 'Wedding anniversary',
        status: 'PENDING' as const,
      },
      {
        employeeId: 'EMP003',
        startDate: new Date(2025, 11, 15), // Dec 15, 2025
        endDate: new Date(2025, 11, 22),   // Dec 22, 2025
        reason: 'Christmas break',
        status: 'PENDING' as const,
      },
      {
        employeeId: 'EMP004',
        startDate: new Date(2025, 8, 1),  // Sep 1, 2025
        endDate: new Date(2025, 8, 5),    // Sep 5, 2025
        reason: 'School holidays',
        status: 'APPROVED' as const,
      },
    ];

    for (const req of demoRequests) {
      const exists = await this.requestRepo.findOne({
        where: {
          employeeId: req.employeeId,
          startDate: req.startDate,
          organizationId,
        },
      });

      if (!exists) {
        const workingDays = 5; // Simplified - assume 5 working days
        const totalMinutes = workingDays * 7.5 * 60; // 7.5h per day

        await this.requestRepo.save(
          this.requestRepo.create({
            employeeId: req.employeeId,
            organizationId,
            leaveTypeId: alLeaveType.id,
            startDate: req.startDate,
            endDate: req.endDate,
            totalMinutesRequested: totalMinutes,
            totalMinutesDeducted: totalMinutes,
            workingDaysCount: workingDays,
            calendarDaysCount: Math.ceil(
              (req.endDate.getTime() - req.startDate.getTime()) / (1000 * 60 * 60 * 24),
            ) + 1,
            reason: req.reason,
            status: req.status,
            noticeDaysGiven: 14,
            meetsNoticeRequirement: true,
            meetsComplianceRules: true,
            balanceBeforeRequest: 224 * 60, // 224h = 28 days
            balanceAfterRequest: (224 * 60) - totalMinutes,
          }),
        );
      }
    }

    this.logger.log(`✅ Created ${demoRequests.length} leave requests`);
  }

  /**
   * Clear all seed data (for testing)
   */
  async clearAll(organizationId: string): Promise<void> {
    this.logger.warn('Clearing all Holiday Planner seed data...');

    await this.requestRepo.delete({ organizationId });
    await this.entitlementRepo.delete({ organizationId });
    await this.publicHolidayRepo.delete({ organizationId });
    await this.workingPatternRepo.delete({ organizationId });
    await this.leaveTypeRepo.delete({ organizationId });

    this.logger.log('✅ Cleared all seed data');
  }
}
