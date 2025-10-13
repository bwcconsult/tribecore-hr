import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthSafetyController } from './health-safety.controller';
import { HealthSafetyEnhancedController } from './controllers/health-safety-enhanced.controller';
import { HealthSafetyService } from './health-safety.service';
import { HealthSafetyEnhancedService } from './services/health-safety-enhanced.service';
import { RiskAssessment } from './entities/risk-assessment.entity';
import { Incident } from './entities/incident.entity';
import { HazardousSubstance } from './entities/hazardous-substance.entity';
import { MethodStatement } from './entities/method-statement.entity';
import { HSResponsibility } from './entities/hs-responsibility.entity';
import { HSAuditLog } from './entities/hs-audit.entity';
import { HealthSafetyPolicy } from './entities/health-safety-policy.entity';
import { TrainingRecord } from './entities/training-record.entity';
import { DSEAssessment } from './entities/dse-assessment.entity';
import { ManualHandlingAssessment } from './entities/manual-handling-assessment.entity';
import { FireRiskAssessment } from './entities/fire-risk-assessment.entity';
import { RIDDORReport } from './entities/riddor-report.entity';
import { PPEManagement } from './entities/ppe-management.entity';
import { WorkplaceInspection } from './entities/workplace-inspection.entity';
import { HSEEnforcement } from './entities/hse-enforcement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RiskAssessment,
      Incident,
      HazardousSubstance,
      MethodStatement,
      HSResponsibility,
      HSAuditLog,
      HealthSafetyPolicy,
      TrainingRecord,
      DSEAssessment,
      ManualHandlingAssessment,
      FireRiskAssessment,
      RIDDORReport,
      PPEManagement,
      WorkplaceInspection,
      HSEEnforcement,
    ]),
  ],
  controllers: [HealthSafetyController, HealthSafetyEnhancedController],
  providers: [HealthSafetyService, HealthSafetyEnhancedService],
  exports: [HealthSafetyService, HealthSafetyEnhancedService],
})
export class HealthSafetyModule {}
