import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OvertimeController } from './overtime.controller';
import { OvertimeEnhancedController } from './controllers/overtime-enhanced.controller';
import { OvertimeService } from './overtime.service';

// Legacy entities
import { OvertimeRequest } from './entities/overtime-request.entity';
import { OvertimePolicy } from './entities/overtime-policy.entity';

// New world-class entities
import { WorkRuleSet } from './entities/work-rule-set.entity';
import { Shift } from './entities/shift.entity';
import { TimeBlock } from './entities/time-block.entity';
import { OvertimeLine } from './entities/overtime-line.entity';
import { CompTimeBank } from './entities/comp-time-bank.entity';
import { OnCallStandby } from './entities/on-call-standby.entity';
import { OvertimeApproval } from './entities/overtime-approval.entity';
import { OvertimeBudget } from './entities/overtime-budget.entity';

// Services
import { OvertimeCalculationEngineService } from './services/overtime-calculation-engine.service';
import { PolicyEngineService } from './services/policy-engine.service';
import { FatigueTrackerService } from './services/fatigue-tracker.service';
import { BudgetValidatorService } from './services/budget-validator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Legacy
      OvertimeRequest,
      OvertimePolicy,
      // New
      WorkRuleSet,
      Shift,
      TimeBlock,
      OvertimeLine,
      CompTimeBank,
      OnCallStandby,
      OvertimeApproval,
      OvertimeBudget,
    ]),
  ],
  controllers: [OvertimeController, OvertimeEnhancedController],
  providers: [
    OvertimeService,
    OvertimeCalculationEngineService,
    PolicyEngineService,
    FatigueTrackerService,
    BudgetValidatorService,
  ],
  exports: [
    OvertimeService,
    OvertimeCalculationEngineService,
    PolicyEngineService,
    FatigueTrackerService,
    BudgetValidatorService,
  ],
})
export class OvertimeModule {}
