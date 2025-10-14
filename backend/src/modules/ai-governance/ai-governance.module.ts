import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AISystem } from './entities/ai-system.entity';
import { AIDecisionLog } from './entities/ai-decision-log.entity';
import { AIGovernanceService } from './services/ai-governance.service';
import { AIGovernanceController } from './controllers/ai-governance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AISystem,
      AIDecisionLog,
    ]),
  ],
  controllers: [AIGovernanceController],
  providers: [AIGovernanceService],
  exports: [AIGovernanceService],
})
export class AIGovernanceModule {}
