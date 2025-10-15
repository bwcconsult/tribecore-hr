import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities - imported from index to ensure correct loading order
import {
  Contract,
  ContractClause,
  ClauseLibrary,
  Approval,
  NegotiationVersion,
  Obligation,
  Renewal,
  Attachment,
  Dispute,
  ContractTemplate,
  ContractAuditLog,
} from './entities';

// Services
import { ContractService } from './services/contract.service';
import { ApprovalService } from './services/approval.service';
import { ObligationService } from './services/obligation.service';
import { RenewalService } from './services/renewal.service';
import { ClauseLibraryService } from './services/clause-library.service';
import { PerformanceScoringService } from './services/performance-scoring.service';
import { DocumentGenerationService } from './services/document-generation.service';
import { NotificationService } from './services/notification.service';

// Controllers
import { ContractsController } from './controllers/contracts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contract,
      ContractClause,
      ClauseLibrary,
      Approval,
      NegotiationVersion,
      Obligation,
      Renewal,
      Attachment,
      Dispute,
      ContractTemplate,
      ContractAuditLog,
    ]),
  ],
  providers: [
    ContractService,
    ApprovalService,
    ObligationService,
    RenewalService,
    ClauseLibraryService,
    PerformanceScoringService,
    DocumentGenerationService,
    NotificationService,
  ],
  controllers: [ContractsController],
  exports: [
    TypeOrmModule,
    ContractService,
    ApprovalService,
    ObligationService,
    RenewalService,
    ClauseLibraryService,
  ],
})
export class ContractsModule {}
