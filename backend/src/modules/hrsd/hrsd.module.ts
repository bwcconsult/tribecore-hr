import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  HRCase,
  CaseComment,
  CaseActivity,
} from './entities/hr-case.entity';
import {
  KnowledgeArticle,
  ArticleFeedback,
} from './entities/knowledge-article.entity';
import {
  ERInvestigation,
  ERInvestigationNote,
} from './entities/er-investigation.entity';
import {
  EmployeeJourney,
  JourneyTemplate,
} from './entities/employee-journey.entity';

// Services
import { CaseManagementService } from './services/case-management.service';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { ERInvestigationService } from './services/er-investigation.service';
import { EmployeeJourneyService } from './services/employee-journey.service';

// Controllers
import { CaseManagementController } from './controllers/case-management.controller';
import { KnowledgeBaseController } from './controllers/knowledge-base.controller';
import { ERInvestigationController } from './controllers/er-investigation.controller';
import { EmployeeJourneyController } from './controllers/employee-journey.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Case Management
      HRCase,
      CaseComment,
      CaseActivity,
      // Knowledge Base
      KnowledgeArticle,
      ArticleFeedback,
      // ER Investigations
      ERInvestigation,
      ERInvestigationNote,
      // Employee Journeys
      EmployeeJourney,
      JourneyTemplate,
    ]),
  ],
  controllers: [
    CaseManagementController,
    KnowledgeBaseController,
    ERInvestigationController,
    EmployeeJourneyController,
  ],
  providers: [
    CaseManagementService,
    KnowledgeBaseService,
    ERInvestigationService,
    EmployeeJourneyService,
  ],
  exports: [
    CaseManagementService,
    KnowledgeBaseService,
    ERInvestigationService,
    EmployeeJourneyService,
  ],
})
export class HRSDModule {}
