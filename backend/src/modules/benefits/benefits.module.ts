import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitsService } from './benefits.service';
import { BenefitsController } from './benefits.controller';
import { BenefitPlan, BenefitEnrollment } from './entities/benefit.entity';
import { Employee } from '../employees/entities/employee.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BenefitPlan, BenefitEnrollment, Employee]),
    UsersModule,
    AuthModule,
  ],
  controllers: [BenefitsController],
  providers: [BenefitsService],
  exports: [BenefitsService],
})
export class BenefitsModule {}
