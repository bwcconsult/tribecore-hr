import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PerformanceEnhancedService } from './services/performance-enhanced.service';
import { PerformanceReview } from './entities/performance.entity';
import { Objective } from './entities/objective.entity';
import { ObjectiveMilestone } from './entities/objective-milestone.entity';
import { Action } from './entities/action.entity';
import { OneOnOne } from './entities/one-on-one.entity';
import { OneOnOneAgendaItem } from './entities/one-on-one-agenda-item.entity';
import { Feedback } from './entities/feedback.entity';
import { Recognition } from './entities/recognition.entity';
import { WellbeingCheck } from './entities/wellbeing-check.entity';
import { ReviewCycle } from './entities/review-cycle.entity';
import { ReviewForm } from './entities/review-form.entity';
import { CalibrationRecord } from './entities/calibration-record.entity';
import { Competency } from './entities/competency.entity';
import { PIP } from './entities/pip.entity';
import { TalentCard } from './entities/talent-card.entity';
import { Nudge } from './entities/nudge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerformanceReview,
      Objective,
      ObjectiveMilestone,
      Action,
      OneOnOne,
      OneOnOneAgendaItem,
      Feedback,
      Recognition,
      WellbeingCheck,
      ReviewCycle,
      ReviewForm,
      CalibrationRecord,
      Competency,
      PIP,
      TalentCard,
      Nudge,
    ]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService, PerformanceEnhancedService],
  exports: [PerformanceService, PerformanceEnhancedService],
})
export class PerformanceModule {}
