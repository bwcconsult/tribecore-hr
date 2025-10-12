import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecognitionController } from './recognition.controller';
import { RecognitionService } from './recognition.service';
import { Recognition } from './entities/recognition.entity';
import { Badge } from './entities/badge.entity';
import { EmployeeBadge } from './entities/employee-badge.entity';
import { RewardPoints, PointsTransaction } from './entities/reward-points.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recognition,
      Badge,
      EmployeeBadge,
      RewardPoints,
      PointsTransaction,
    ]),
  ],
  controllers: [RecognitionController],
  providers: [RecognitionService],
  exports: [RecognitionService],
})
export class RecognitionModule {}
