import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitsService } from './benefits.service';
import { BenefitsController } from './benefits.controller';
import { Benefit, EmployeeBenefit } from './entities/benefit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Benefit, EmployeeBenefit])],
  controllers: [BenefitsController],
  providers: [BenefitsService],
  exports: [BenefitsService],
})
export class BenefitsModule {}
