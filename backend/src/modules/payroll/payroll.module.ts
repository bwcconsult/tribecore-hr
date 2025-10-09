import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { Payroll } from './entities/payroll.entity';
import { TaxCalculatorService } from './services/tax-calculator.service';
import { UKTaxService } from './services/uk-tax.service';
import { USATaxService } from './services/usa-tax.service';
import { NigeriaTaxService } from './services/nigeria-tax.service';
import { PayslipService } from './services/payslip.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll])],
  controllers: [PayrollController],
  providers: [
    PayrollService,
    TaxCalculatorService,
    UKTaxService,
    USATaxService,
    NigeriaTaxService,
    PayslipService,
  ],
  exports: [PayrollService],
})
export class PayrollModule {}
