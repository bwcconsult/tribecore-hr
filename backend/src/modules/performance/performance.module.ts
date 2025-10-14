import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PerformanceEnhancedService } from './services/performance-enhanced.service';
import { PerformanceEnhancedController } from './controllers/performance-enhanced.controller';
import { PerformanceSchedulerService } from './services/performance-scheduler.service';
import { IntegrationNotificationService } from './services/integration-notification.service';
import { HRRecordsService } from './services/hr-records.service';
import { PerformanceWorkflowService } from './services/performance-workflow.service';
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
import { Employee } from '../employees/entities/employee.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { IntegrationsModule } from '../integrations/integrations.module';

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
      Employee,
      Notification,
    ]),
    ScheduleModule.forRoot(),
    NotificationsModule,
    IntegrationsModule,
  ],
  controllers: [PerformanceController, PerformanceEnhancedController],
  providers: [
    PerformanceService,
    PerformanceEnhancedService,
    PerformanceSchedulerService,
    IntegrationNotificationService,
    HRRecordsService,
    PerformanceWorkflowService,
  ],
  exports: [
    PerformanceService,
    PerformanceEnhancedService,
    PerformanceSchedulerService,
    IntegrationNotificationService,
    HRRecordsService,
    PerformanceWorkflowService,
  ],
})
export class PerformanceModule {}
