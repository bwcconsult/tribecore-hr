import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalServicesController } from './legal-services.controller';
import { LegalServicesService } from './legal-services.service';
import { EmploymentLawController } from './controllers/employment-law.controller';
import { EmploymentLawService } from './services/employment-law.service';
import { LegalAdviceRequest } from './entities/legal-advice-request.entity';
import { DocumentTemplate } from './entities/document-template.entity';
import { HRInsuranceClaim } from './entities/hr-insurance-claim.entity';
import { EqualityCase } from './entities/equality-case.entity';
import { WorkingTimeCompliance } from './entities/working-time-compliance.entity';
import { RedundancyProcess } from './entities/redundancy-process.entity';
import { WhistleblowingCase } from './entities/whistleblowing-case.entity';
import { EmploymentContract } from './entities/employment-contract.entity';
import { MinimumWageCompliance } from './entities/minimum-wage-compliance.entity';
import { FamilyLeave } from './entities/family-leave.entity';
import { GDPRDataRequest, GDPRDataBreach } from './entities/gdpr-compliance.entity';
import { AgencyWorker } from './entities/agency-worker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LegalAdviceRequest,
      DocumentTemplate,
      HRInsuranceClaim,
      EqualityCase,
      WorkingTimeCompliance,
      RedundancyProcess,
      WhistleblowingCase,
      EmploymentContract,
      MinimumWageCompliance,
      FamilyLeave,
      GDPRDataRequest,
      GDPRDataBreach,
      AgencyWorker,
    ]),
  ],
  controllers: [LegalServicesController, EmploymentLawController],
  providers: [LegalServicesService, EmploymentLawService],
  exports: [LegalServicesService, EmploymentLawService],
})
export class LegalServicesModule {}
