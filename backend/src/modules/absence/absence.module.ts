import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { AbsencePlan } from './entities/absence-plan.entity';
import { AccrualPolicy } from './entities/accrual-policy.entity';
import { AbsenceRequest } from './entities/absence-request.entity';
import { AbsenceBalance } from './entities/absence-balance.entity';
import { SicknessEpisode } from './entities/sickness-episode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AbsencePlan,
      AccrualPolicy,
      AbsenceRequest,
      AbsenceBalance,
      SicknessEpisode,
    ]),
  ],
  providers: [AbsenceService],
  controllers: [AbsenceController],
  exports: [AbsenceService, TypeOrmModule],
})
export class AbsenceModule {}
