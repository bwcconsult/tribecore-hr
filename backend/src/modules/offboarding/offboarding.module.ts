import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffboardingController } from './offboarding.controller';
import { OffboardingService } from './offboarding.service';
import { OffboardingProcess } from './entities/offboarding.entity';
import { OffboardingTask } from './entities/offboarding-task.entity';
import { ExitInterview } from './entities/exit-interview.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OffboardingProcess,
      OffboardingTask,
      ExitInterview,
    ]),
  ],
  controllers: [OffboardingController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class OffboardingModule {}
