import { DataSource } from 'typeorm';
import { AbsencePlan, AbsencePlanType, AbsenceUnit, ApprovalChainType } from '../../modules/absence/entities/absence-plan.entity';
import { UserRole } from '../../common/enums';

/**
 * Seed Default Absence Plans
 * Creates 5 standard absence plan types
 */
export async function seedAbsencePlans(dataSource: DataSource) {
  const planRepository = dataSource.getRepository(AbsencePlan);

  const defaultPlans: Partial<AbsencePlan>[] = [
    {
      name: 'Holiday 2026 Plan',
      type: AbsencePlanType.HOLIDAY,
      unit: AbsenceUnit.DAY,
      description: 'Annual holiday entitlement for 2026',
      defaultEntitlementDays: 25,
      approvalChainType: ApprovalChainType.MANAGER,
      allowsNegativeBalance: false,
      requiresAttachment: false,
      carryoverRules: {
        enabled: true,
        maxDays: 5,
        expiryMonths: 3,
      },
      roundingRules: {
        method: 'NEAREST',
        precision: 0.5,
      },
      excludesPublicHolidays: true,
      visibleToRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      isActive: true,
      effectiveFrom: new Date('2026-01-01'),
      effectiveTo: new Date('2026-12-31'),
    },
    {
      name: 'Birthday Leave',
      type: AbsencePlanType.BIRTHDAY,
      unit: AbsenceUnit.DAY,
      description: 'One day off for your birthday',
      defaultEntitlementDays: 1,
      approvalChainType: ApprovalChainType.MANAGER,
      allowsNegativeBalance: false,
      requiresAttachment: false,
      roundingRules: {
        method: 'NEAREST',
        precision: 1,
      },
      excludesPublicHolidays: false,
      visibleToRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      isActive: true,
    },
    {
      name: 'Level Up Days',
      type: AbsencePlanType.LEVEL_UP_DAYS,
      unit: AbsenceUnit.DAY,
      description: 'Earned time off for professional development (rolling year)',
      defaultEntitlementDays: 3,
      approvalChainType: ApprovalChainType.MANAGER,
      allowsNegativeBalance: false,
      requiresAttachment: false,
      roundingRules: {
        method: 'NEAREST',
        precision: 0.5,
      },
      excludesPublicHolidays: true,
      visibleToRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      isActive: true,
    },
    {
      name: 'Sickness Absence',
      type: AbsencePlanType.SICKNESS,
      unit: AbsenceUnit.DAY,
      description: 'Sick leave tracking with episodes (rolling year)',
      defaultEntitlementDays: 0, // No limit on sick days
      approvalChainType: ApprovalChainType.NONE, // Self-service, but requires notification
      allowsNegativeBalance: true,
      requiresAttachment: true, // Medical certificate after 7 days
      roundingRules: {
        method: 'UP',
        precision: 1,
      },
      excludesPublicHolidays: true,
      visibleToRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      isActive: true,
    },
    {
      name: 'Other Absences',
      type: AbsencePlanType.OTHER,
      unit: AbsenceUnit.HOUR,
      description: 'TOIL, study leave, and other absence types',
      defaultEntitlementDays: 0,
      approvalChainType: ApprovalChainType.MANAGER_AND_HR,
      allowsNegativeBalance: false,
      requiresAttachment: false,
      roundingRules: {
        method: 'NEAREST',
        precision: 0.25, // 15-minute increments
      },
      excludesPublicHolidays: false,
      visibleToRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      isActive: true,
    },
  ];

  for (const planData of defaultPlans) {
    const existingPlan = await planRepository.findOne({
      where: { name: planData.name },
    });

    if (!existingPlan) {
      const plan = planRepository.create(planData);
      await planRepository.save(plan);
      console.log(`✅ Created absence plan: ${planData.name}`);
    } else {
      console.log(`⏭️  Absence plan already exists: ${planData.name}`);
    }
  }

  console.log('✅ Absence plans seeding completed');
}
