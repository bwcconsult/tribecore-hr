import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { WorkRuleSet, Country, Sector } from '../entities/work-rule-set.entity';

/**
 * PolicyEngine
 * Matches and loads appropriate overtime policies
 * Provides country-specific policy templates
 */
@Injectable()
export class PolicyEngineService {
  private readonly logger = new Logger(PolicyEngineService.name);

  constructor(
    @InjectRepository(WorkRuleSet)
    private workRuleSetRepository: Repository<WorkRuleSet>,
  ) {}

  /**
   * Find active policy for employee/location/date
   */
  async findApplicablePolicy(params: {
    country: Country;
    sector?: Sector;
    stateProvince?: string;
    unionCBA?: string;
    effectiveDate?: Date;
  }): Promise<WorkRuleSet | null> {
    const effectiveDate = params.effectiveDate || new Date();

    const queryBuilder = this.workRuleSetRepository
      .createQueryBuilder('ruleSet')
      .where('ruleSet.country = :country', { country: params.country })
      .andWhere('ruleSet.isActive = :active', { active: true })
      .andWhere('ruleSet.effectiveFrom <= :date', { date: effectiveDate })
      .andWhere(
        'ruleSet.effectiveTo IS NULL OR ruleSet.effectiveTo >= :date',
        { date: effectiveDate },
      );

    // Filter by sector if provided
    if (params.sector) {
      queryBuilder.andWhere('ruleSet.sector = :sector', { sector: params.sector });
    }

    // Filter by state/province (for US state-specific rules)
    if (params.stateProvince) {
      queryBuilder.andWhere('ruleSet.stateProvince = :state', { state: params.stateProvince });
    }

    // Filter by union CBA
    if (params.unionCBA) {
      queryBuilder.andWhere('ruleSet.unionCBA = :union', { union: params.unionCBA });
    }

    // Order by specificity (most specific first)
    queryBuilder.orderBy('ruleSet.stateProvince', 'DESC', 'NULLS LAST');
    queryBuilder.addOrderBy('ruleSet.unionCBA', 'DESC', 'NULLS LAST');
    queryBuilder.addOrderBy('ruleSet.sector', 'DESC');
    queryBuilder.addOrderBy('ruleSet.effectiveFrom', 'DESC');

    const policy = await queryBuilder.getOne();

    if (!policy) {
      this.logger.warn(`No policy found for ${params.country} ${params.sector || 'General'}`);
    }

    return policy;
  }

  /**
   * Create US FLSA standard policy
   */
  async createUSFLSAPolicy(organizationId: string): Promise<WorkRuleSet> {
    const policy = this.workRuleSetRepository.create({
      name: 'US FLSA Standard',
      description: 'Federal Fair Labor Standards Act - Standard overtime rules',
      country: Country.US,
      sector: Sector.GENERAL,
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      
      weeklyHoursThreshold: 40,
      dailyHoursThreshold: null, // Federal has no daily OT
      weekResetDay: 0, // Sunday
      
      premiumLadders: {
        weeklyOT1: {
          afterHours: 40,
          multiplier: 1.5,
          earningCode: 'OT_150',
        },
      },
      
      stackingStrategy: 'HIGHEST',
      minimumRestHours: null, // Federal has no minimum rest
      weeklyRestHours: null,
      maxWeeklyHours: null,
      allowOptOut: false,
      
      approvalHierarchy: {
        level1: { role: 'MANAGER', autoApproveUnder: 2 },
        level2: { role: 'DEPARTMENT_HEAD' },
        slaHours: 24,
        escalationHours: 48,
      },
      
      roundingMethod: 'NEAREST_15MIN',
      graceMinutes: 7,
      
      metadata: {
        legislationReferences: ['29 USC 207(a)(1)', 'FLSA'],
        notes: 'Standard federal overtime - non-exempt employees only',
      },
    });

    return this.workRuleSetRepository.save(policy);
  }

  /**
   * Create California daily OT policy
   */
  async createCaliforniaPolicy(organizationId: string): Promise<WorkRuleSet> {
    const policy = this.workRuleSetRepository.create({
      name: 'California Labor Code - Overtime',
      description: 'California state overtime with daily thresholds',
      country: Country.US,
      stateProvince: 'CA',
      sector: Sector.GENERAL,
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      
      weeklyHoursThreshold: 40,
      dailyHoursThreshold: 8, // CA specific
      weekResetDay: 0,
      
      premiumLadders: {
        dailyOT1: {
          afterHours: 8,
          multiplier: 1.5,
          earningCode: 'CA_OT_150',
        },
        dailyOT2: {
          afterHours: 12,
          multiplier: 2.0,
          earningCode: 'CA_OT_200',
        },
        weeklyOT1: {
          afterHours: 40,
          multiplier: 1.5,
          earningCode: 'CA_OT_150',
        },
        consecutiveDay7: {
          multiplier: 2.0,
          earningCode: 'CA_7TH_DAY',
        },
        splitShift: {
          minimumGapHours: 1,
          premium: 25, // 1 hour minimum wage
          earningCode: 'CA_SPLIT',
        },
        mealPenalty: {
          afterHours: 5,
          penalty: 25, // 1 hour pay
          earningCode: 'CA_MEAL_PEN',
        },
        restPenalty: {
          afterHours: 3.5,
          penalty: 25,
          earningCode: 'CA_REST_PEN',
        },
      },
      
      stackingStrategy: 'HIGHEST', // CA: choose highest, don't stack
      minimumRestHours: null,
      
      approvalHierarchy: {
        level1: { role: 'MANAGER', autoApproveUnder: 2 },
        level2: { role: 'DEPARTMENT_HEAD' },
        slaHours: 24,
        escalationHours: 48,
      },
      
      roundingMethod: 'NEAREST_15MIN',
      graceMinutes: 7,
      
      metadata: {
        legislationReferences: [
          'California Labor Code Section 510',
          'California IWC Orders',
        ],
      },
    });

    return this.workRuleSetRepository.save(policy);
  }

  /**
   * Create UK/NHS policy
   */
  async createUKNHSPolicy(organizationId: string): Promise<WorkRuleSet> {
    const policy = this.workRuleSetRepository.create({
      name: 'NHS Agenda for Change',
      description: 'UK NHS unsocial hours and on-call premiums',
      country: Country.UK,
      sector: Sector.NHS,
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      
      weeklyHoursThreshold: 48, // EU WTD
      dailyHoursThreshold: null,
      weekResetDay: 1, // Monday
      
      premiumLadders: {
        weeklyOT1: {
          afterHours: 48,
          multiplier: 1.5,
          earningCode: 'NHS_OT',
        },
        night: {
          startTime: '20:00',
          endTime: '06:00',
          multiplier: 1.3, // 30% unsocial hours
          earningCode: 'NHS_NIGHT',
        },
        weekend: {
          multiplier: 1.5, // Saturday/Sunday premium
          earningCode: 'NHS_WKD',
        },
        holiday: {
          multiplier: 2.0, // Bank Holiday
          earningCode: 'NHS_HOL',
        },
      },
      
      onCallPolicy: {
        enabled: true,
        flatRate: 50, // Availability supplement
        callOutMinimumHours: 3,
        travelTimePaid: true,
        travelTimeMultiplier: 1.0,
      },
      
      stackingStrategy: 'ADD_ON', // NHS: stack unsocial hours
      minimumRestHours: 11, // EU WTD
      weeklyRestHours: 24,
      maxWeeklyHours: 48,
      allowOptOut: true, // Can opt out of 48h limit
      
      approvalHierarchy: {
        level1: { role: 'ROSTER_COORDINATOR', autoApproveUnder: 4 },
        level2: { role: 'MATRON' },
        level3: { role: 'FINANCE' },
        slaHours: 48,
        escalationHours: 72,
      },
      
      roundingMethod: 'NEAREST_15MIN',
      graceMinutes: 5,
      
      specialRules: {
        nhsSafeStaffingRatio: 6, // 6 patients per nurse
      },
      
      metadata: {
        legislationReferences: [
          'NHS Agenda for Change',
          'EU Working Time Directive',
          'UK Working Time Regulations 1998',
        ],
      },
    });

    return this.workRuleSetRepository.save(policy);
  }

  /**
   * Create EU WTD policy (general)
   */
  async createEUPolicy(organizationId: string): Promise<WorkRuleSet> {
    const policy = this.workRuleSetRepository.create({
      name: 'EU Working Time Directive',
      description: 'European Union working time regulations',
      country: Country.EU,
      sector: Sector.GENERAL,
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      
      weeklyHoursThreshold: 48,
      dailyHoursThreshold: null,
      weekResetDay: 1,
      
      premiumLadders: {
        weeklyOT1: {
          afterHours: 48,
          multiplier: 1.5,
          earningCode: 'EU_OT',
        },
        night: {
          startTime: '22:00',
          endTime: '06:00',
          multiplier: 1.25,
          earningCode: 'EU_NIGHT',
        },
      },
      
      stackingStrategy: 'HIGHEST',
      minimumRestHours: 11, // Daily rest
      weeklyRestHours: 24, // Weekly rest
      maxDailyHours: 13, // Including breaks
      maxWeeklyHours: 48,
      maxConsecutiveDays: 6,
      allowOptOut: true,
      
      approvalHierarchy: {
        level1: { role: 'MANAGER' },
        level2: { role: 'HR' },
        slaHours: 48,
        escalationHours: 72,
      },
      
      roundingMethod: 'NEAREST_15MIN',
      graceMinutes: 5,
      
      metadata: {
        legislationReferences: ['EU Directive 2003/88/EC'],
      },
    });

    return this.workRuleSetRepository.save(policy);
  }

  /**
   * Create South Africa BCEA policy
   */
  async createSouthAfricaPolicy(organizationId: string): Promise<WorkRuleSet> {
    const policy = this.workRuleSetRepository.create({
      name: 'South Africa BCEA',
      description: 'Basic Conditions of Employment Act overtime rules',
      country: Country.ZA,
      sector: Sector.GENERAL,
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      
      weeklyHoursThreshold: 45,
      dailyHoursThreshold: 9,
      weekResetDay: 1,
      
      premiumLadders: {
        dailyOT1: {
          afterHours: 9,
          multiplier: 1.5,
          earningCode: 'ZA_OT_150',
        },
        weeklyOT1: {
          afterHours: 45,
          multiplier: 1.5,
          earningCode: 'ZA_OT_150',
        },
        weekend: {
          multiplier: 2.0, // Sunday/PH
          earningCode: 'ZA_SUN',
        },
        holiday: {
          multiplier: 2.0,
          earningCode: 'ZA_HOL',
        },
        night: {
          startTime: '18:00',
          endTime: '06:00',
          multiplier: 1.1, // 10% night allowance
          earningCode: 'ZA_NIGHT',
        },
      },
      
      stackingStrategy: 'HIGHEST',
      minimumRestHours: 12,
      weeklyRestHours: 36,
      maxConsecutiveDays: 6,
      
      budgetRules: {
        enforceWeeklyCapHours: 10, // Max 10h OT per week
      },
      
      approvalHierarchy: {
        level1: { role: 'SUPERVISOR' },
        level2: { role: 'MANAGER' },
        slaHours: 24,
        escalationHours: 48,
      },
      
      roundingMethod: 'NEAREST_15MIN',
      graceMinutes: 7,
      
      metadata: {
        legislationReferences: ['BCEA Act 75 of 1997', 'Section 10'],
      },
    });

    return this.workRuleSetRepository.save(policy);
  }

  /**
   * Create Nigeria Labour Act policy
   */
  async createNigeriaPolicy(organizationId: string): Promise<WorkRuleSet> {
    const policy = this.workRuleSetRepository.create({
      name: 'Nigeria Labour Act',
      description: 'Nigerian overtime and working hours regulations',
      country: Country.NG,
      sector: Sector.GENERAL,
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      
      weeklyHoursThreshold: 40,
      dailyHoursThreshold: 8,
      weekResetDay: 1,
      
      premiumLadders: {
        weeklyOT1: {
          afterHours: 40,
          multiplier: 1.5,
          earningCode: 'NG_OT',
        },
        holiday: {
          multiplier: 2.0,
          earningCode: 'NG_HOL',
        },
        night: {
          startTime: '20:00',
          endTime: '06:00',
          multiplier: 1.25,
          earningCode: 'NG_NIGHT',
        },
      },
      
      stackingStrategy: 'HIGHEST',
      minimumRestHours: 8,
      weeklyRestHours: 24,
      
      approvalHierarchy: {
        level1: { role: 'SUPERVISOR' },
        level2: { role: 'MANAGER' },
        slaHours: 24,
        escalationHours: 48,
      },
      
      roundingMethod: 'NEAREST_15MIN',
      graceMinutes: 7,
      
      metadata: {
        legislationReferences: ['Nigerian Labour Act Cap L1 LFN 2004'],
      },
    });

    return this.workRuleSetRepository.save(policy);
  }

  /**
   * Initialize default policies for organization
   */
  async initializeDefaultPolicies(organizationId: string): Promise<WorkRuleSet[]> {
    this.logger.log(`Initializing default policies for organization ${organizationId}`);

    const policies: WorkRuleSet[] = [];

    try {
      // Create all country-specific policies
      policies.push(await this.createUSFLSAPolicy(organizationId));
      policies.push(await this.createCaliforniaPolicy(organizationId));
      policies.push(await this.createUKNHSPolicy(organizationId));
      policies.push(await this.createEUPolicy(organizationId));
      policies.push(await this.createSouthAfricaPolicy(organizationId));
      policies.push(await this.createNigeriaPolicy(organizationId));

      this.logger.log(`Created ${policies.length} default policies`);
    } catch (error) {
      this.logger.error(`Failed to initialize policies: ${error.message}`);
      throw error;
    }

    return policies;
  }

  /**
   * Validate if hours comply with policy
   */
  async validateCompliance(
    hours: number,
    consecutiveDays: number,
    restHoursSinceLastShift: number,
    policy: WorkRuleSet,
  ): Promise<{ compliant: boolean; violations: string[] }> {
    const violations: string[] = [];

    // Check max daily hours
    if (policy.maxDailyHours && hours > policy.maxDailyHours) {
      violations.push(`Exceeds maximum daily hours (${hours}h > ${policy.maxDailyHours}h)`);
    }

    // Check consecutive days
    if (policy.maxConsecutiveDays && consecutiveDays > policy.maxConsecutiveDays) {
      violations.push(`Exceeds maximum consecutive days (${consecutiveDays} > ${policy.maxConsecutiveDays})`);
    }

    // Check rest period
    if (policy.minimumRestHours && restHoursSinceLastShift < policy.minimumRestHours) {
      violations.push(`Insufficient rest period (${restHoursSinceLastShift}h < ${policy.minimumRestHours}h required)`);
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }
}
