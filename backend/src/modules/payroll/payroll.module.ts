import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { Payroll } from './entities/payroll.entity';
import { SalaryStructure } from './entities/salary-structure.entity';
import { ContractorPayment } from './entities/contractor-payment.entity';
import { PayrollRun } from './entities/payroll-run.entity';
import { TaxFiling } from './entities/tax-filing.entity';
import { TaxCalculatorService } from './services/tax-calculator.service';
import { UKTaxService } from './services/uk-tax.service';
import { USATaxService } from './services/usa-tax.service';
import { NigeriaTaxService } from './services/nigeria-tax.service';
import { PayslipService } from './services/payslip.service';
import { GlobalTaxCalculatorService } from './services/global-tax-calculator.service';
import { FxConversionService } from './services/fx-conversion.service';
import { BankFileGeneratorService } from './services/bank-file-generator.service';
import { PayrollCalculationService } from './services/payroll-calculation.service';
import { FinanceIntegrationService } from './services/finance-integration.service';
import { PayrollRunController } from './controllers/payroll-run.controller';
import { ContractorPaymentController } from './controllers/contractor-payment.controller';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payroll,
      SalaryStructure,
      ContractorPayment,
      PayrollRun,
      TaxFiling,
      Employee,
    ]),
  ],
  controllers: [
    PayrollController,
    PayrollRunController,
    ContractorPaymentController,
  ],
  providers: [
    PayrollService,
    TaxCalculatorService,
    UKTaxService,
    USATaxService,
    NigeriaTaxService,
    PayslipService,
    GlobalTaxCalculatorService,
    FxConversionService,
    BankFileGeneratorService,
    PayrollCalculationService,
    FinanceIntegrationService,
  ],
  exports: [
    PayrollService,
    GlobalTaxCalculatorService,
    FxConversionService,
    PayrollCalculationService,
  ],
})
export class PayrollModule {}
