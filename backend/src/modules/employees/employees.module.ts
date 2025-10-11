import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { BankDetailsService } from './bank-details.service';
import { BankDetailsController } from './bank-details.controller';
import { Employee } from './entities/employee.entity';
import { EmploymentActivity } from './entities/employment-activity.entity';
import { WorkSchedule } from './entities/work-schedule.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { Dependant } from './entities/dependant.entity';
import { BankDetails } from './entities/bank-details.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      EmploymentActivity,
      WorkSchedule,
      EmergencyContact,
      Dependant,
      BankDetails,
    ]),
  ],
  controllers: [EmployeesController, ProfileController, BankDetailsController],
  providers: [EmployeesService, ProfileService, BankDetailsService],
  exports: [EmployeesService, ProfileService, BankDetailsService],
})
export class EmployeesModule {}
