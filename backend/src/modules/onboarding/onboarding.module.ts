import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Legacy entities
import { OnboardingWorkflow } from './entities/onboarding.entity';

// Employee Onboarding Entities
import { OnboardingTemplate } from './entities/onboarding-template.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { OnboardCase } from './entities/onboard-case.entity';
import { OnboardingTask } from './entities/onboarding-task.entity';
import { OnboardingDocument } from './entities/onboarding-document.entity';
import { ProvisioningTicket } from './entities/provisioning-ticket.entity';
import { Checkin } from './entities/checkin.entity';

// Customer Onboarding Entities
import { ClientAccount } from './entities/client-account.entity';
import { ClientContact } from './entities/client-contact.entity';
import { ClientOnboardingCase } from './entities/client-onboarding-case.entity';
import { Workstream } from './entities/workstream.entity';
import { COTask } from './entities/co-task.entity';
import { CODocument } from './entities/co-document.entity';
import { Environment } from './entities/environment.entity';
import { Risk } from './entities/risk.entity';
import { SuccessPlan } from './entities/success-plan.entity';

// Shared Entities
import { Note } from './entities/note.entity';

// Legacy Services
import { OnboardingService } from './onboarding.service';

// New Services
import { TemplateService } from './services/template.service';
import { OnboardingCaseService } from './services/onboarding-case.service';
import { NotesService } from './services/notes.service';
import { CXOService } from './services/cxo.service';
import { RiskService } from './services/risk.service';

// Legacy Controllers
import { OnboardingController } from './onboarding.controller';

// New Controllers
import { TemplateController } from './controllers/template.controller';
import { OnboardingCaseController } from './controllers/onboarding-case.controller';
import { OnboardingTasksController } from './controllers/onboarding-tasks.controller';
import { NotesController } from './controllers/notes.controller';
import { CXOController } from './controllers/cxo.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { AdditionalResourcesController, CXOResourcesController } from './controllers/additional-resources.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Legacy
      OnboardingWorkflow,
      // Employee Onboarding
      OnboardingTemplate,
      ChecklistItem,
      OnboardCase,
      OnboardingTask,
      OnboardingDocument,
      ProvisioningTicket,
      Checkin,
      // Customer Onboarding
      ClientAccount,
      ClientContact,
      ClientOnboardingCase,
      Workstream,
      COTask,
      CODocument,
      Environment,
      Risk,
      SuccessPlan,
      // Shared
      Note,
    ]),
  ],
  controllers: [
    // Legacy
    OnboardingController,
    // New Controllers
    TemplateController,
    OnboardingCaseController,
    OnboardingTasksController,
    NotesController,
    CXOController,
    DashboardController,
    AdditionalResourcesController,
    CXOResourcesController,
  ],
  providers: [
    // Legacy
    OnboardingService,
    // New Services
    TemplateService,
    OnboardingCaseService,
    NotesService,
    CXOService,
    RiskService,
  ],
  exports: [
    // Legacy
    OnboardingService,
    // New Services
    TemplateService,
    OnboardingCaseService,
    NotesService,
    CXOService,
    RiskService,
  ],
})
export class OnboardingModule {}
