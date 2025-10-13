import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalServicesController } from './legal-services.controller';
import { LegalServicesService } from './legal-services.service';
import { LegalAdviceRequest } from './entities/legal-advice-request.entity';
import { DocumentTemplate } from './entities/document-template.entity';
import { HRInsuranceClaim } from './entities/hr-insurance-claim.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LegalAdviceRequest,
      DocumentTemplate,
      HRInsuranceClaim,
    ]),
  ],
  controllers: [LegalServicesController],
  providers: [LegalServicesService],
  exports: [LegalServicesService],
})
export class LegalServicesModule {}
