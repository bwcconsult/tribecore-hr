import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Contract } from './entities/contract.entity';
import { ContractClause } from './entities/contract-clause.entity';
import { ClauseLibrary } from './entities/clause-library.entity';
import { Approval } from './entities/approval.entity';
import { NegotiationVersion } from './entities/negotiation-version.entity';
import { Obligation } from './entities/obligation.entity';
import { Renewal } from './entities/renewal.entity';
import { Attachment } from './entities/attachment.entity';
import { Dispute } from './entities/dispute.entity';
import { ContractTemplate } from './entities/contract-template.entity';
import { ContractAuditLog } from './entities/contract-audit-log.entity';

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
