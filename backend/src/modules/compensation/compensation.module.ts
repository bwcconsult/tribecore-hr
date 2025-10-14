import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompensationBand } from './entities/compensation-band.entity';
import { CompensationReview } from './entities/compensation-review.entity';
import { CompensationService } from './services/compensation.service';
import { CompensationController } from './controllers/compensation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompensationBand, CompensationReview]),
  ],
  controllers: [CompensationController],
  providers: [CompensationService],
  exports: [CompensationService],
})
export class CompensationModule {}
