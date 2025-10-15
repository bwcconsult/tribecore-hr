import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Legacy entities
import { Job, JobApplication } from './entities/job.entity';

// New entities
import { Requisition } from './entities/requisition.entity';
import { Candidate } from './entities/candidate.entity';
import { Application } from './entities/application.entity';
import { JobPosting } from './entities/job-posting.entity';
import { Interview } from './entities/interview.entity';
import { Scorecard } from './entities/scorecard.entity';
import { Offer } from './entities/offer.entity';
import { Check } from './entities/check.entity';
import { Note } from './entities/note.entity';
import { StageLog } from './entities/stage-log.entity';
import { Watcher } from './entities/watcher.entity';
import { Attachment } from './entities/attachment.entity';

// Services
import { RecruitmentService } from './recruitment.service';
import { WorkflowService } from './services/workflow.service';
import { ApprovalService } from './services/approval.service';
import { AIScoringService } from './services/ai-scoring.service';
import { SchedulingService } from './services/scheduling.service';
import { ComplianceService } from './services/compliance.service';
import { RecruitmentNotificationService } from './services/recruitment-notification.service';
import { AnalyticsService } from './services/analytics.service';

// Integrations
import { EmailIntegrationService } from './integrations/email.integration';
import { CalendarIntegrationService } from './integrations/calendar.integration';
import { JobBoardIntegrationService } from './integrations/job-board.integration';
import { BackgroundCheckIntegrationService } from './integrations/background-check.integration';

// Advanced Services
import { ResumeParserService } from './services/resume-parser.service';
import { CandidateSourcingService } from './services/candidate-sourcing.service';
import { ChatbotService } from './services/chatbot.service';
import { VideoScreeningService } from './services/video-screening.service';
import { WebhookService } from './services/webhook.service';
import { MultiTenantService } from './services/multi-tenant.service';

// Controllers
import { RecruitmentController } from './recruitment.controller';
import { RequisitionController } from './controllers/requisition.controller';
import { ApplicationController } from './controllers/application.controller';
import { InterviewController } from './controllers/interview.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { AdvancedController } from './controllers/advanced.controller';

// Import NotificationsModule for NotificationHelperService
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Legacy
      Job,
      JobApplication,
      // New
      Requisition,
      Candidate,
      Application,
      JobPosting,
      Interview,
      Scorecard,
      Offer,
      Check,
      Note,
      StageLog,
      Watcher,
      Attachment,
    ]),
    NotificationsModule, // For NotificationHelperService
  ],
  controllers: [
    RecruitmentController,
    RequisitionController,
    ApplicationController,
    InterviewController,
    AnalyticsController,
    AdvancedController,
  ],
  providers: [
    RecruitmentService,
    WorkflowService,
    ApprovalService,
    AIScoringService,
    SchedulingService,
    ComplianceService,
    RecruitmentNotificationService,
    AnalyticsService,
    // Integrations
    EmailIntegrationService,
    CalendarIntegrationService,
    JobBoardIntegrationService,
    BackgroundCheckIntegrationService,
    // Advanced Services
    ResumeParserService,
    CandidateSourcingService,
    ChatbotService,
    VideoScreeningService,
    WebhookService,
    MultiTenantService,
  ],
  exports: [
    RecruitmentService,
    WorkflowService,
    ApprovalService,
    AIScoringService,
    SchedulingService,
    ComplianceService,
    RecruitmentNotificationService,
    AnalyticsService,
    // Integrations
    EmailIntegrationService,
    CalendarIntegrationService,
    JobBoardIntegrationService,
    BackgroundCheckIntegrationService,
    // Advanced Services
    ResumeParserService,
    CandidateSourcingService,
    ChatbotService,
    VideoScreeningService,
    WebhookService,
    MultiTenantService,
  ],
})
export class RecruitmentModule {}
