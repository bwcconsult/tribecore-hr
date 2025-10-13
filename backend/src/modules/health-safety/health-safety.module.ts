import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthSafetyController } from './health-safety.controller';
import { HealthSafetyService } from './health-safety.service';
import { RiskAssessment } from './entities/risk-assessment.entity';
import { Incident } from './entities/incident.entity';
import { HazardousSubstance } from './entities/hazardous-substance.entity';
import { MethodStatement } from './entities/method-statement.entity';
import { HSResponsibility } from './entities/hs-responsibility.entity';
import { HSAuditLog } from './entities/hs-audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RiskAssessment,
      Incident,
      HazardousSubstance,
      MethodStatement,
      HSResponsibility,
      HSAuditLog,
    ]),
  ],
  controllers: [HealthSafetyController],
  providers: [HealthSafetyService],
  exports: [HealthSafetyService],
})
export class HealthSafetyModule {}
