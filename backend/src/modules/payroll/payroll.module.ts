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
import { AiForecastingService } from './services/ai-forecasting.service';
import { BulkProcessingService } from './services/bulk-processing.service';
import { ThirteenthMonthService } from './services/thirteenth-month.service';
import { BonusCommissionService } from './services/bonus-commission.service';
import { AuditTrailService } from './services/audit-trail.service';
import { PayrollRunController } from './controllers/payroll-run.controller';
import { ContractorPaymentController } from './controllers/contractor-payment.controller';
import { AdvancedPayrollController } from './controllers/advanced-payroll.controller';
import { Employee } from '../employees/entities/employee.entity';

// Payslip System imports
import { PayslipCalculationEngineService } from './services/payslip-calculation-engine.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { EmailTemplateService } from './services/email-template.service';
import { PayslipController } from './controllers/payslip.controller';
import {
  Payslip,
  PayslipEarning,
  PayslipDeduction,
  PayslipTax,
  PayslipGarnishment,
  PayslipEmployerContribution,
  PayslipAllowance,
  PayslipReimbursement,
} from './entities/payslip.entity';
import {
  EarningCode,
  DeductionCode,
  TaxCode,
  BenefitPlan,
  PayslipTemplate,
  JurisdictionRule,
} from './entities/payslip-codes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payroll,
      SalaryStructure,
      ContractorPayment,
      PayrollRun,
      TaxFiling,
      Employee,
      // Payslip System entities
      Payslip,
      PayslipEarning,
      PayslipDeduction,
      PayslipTax,
      PayslipGarnishment,
      PayslipEmployerContribution,
      PayslipAllowance,
      PayslipReimbursement,
      EarningCode,
      DeductionCode,
      TaxCode,
      BenefitPlan,
      PayslipTemplate,
      JurisdictionRule,
    ]),
  ],
  controllers: [
    PayrollController,
    PayrollRunController,
    ContractorPaymentController,
    AdvancedPayrollController,
    PayslipController, // NEW
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
    AiForecastingService,
    BulkProcessingService,
    ThirteenthMonthService,
    BonusCommissionService,
    AuditTrailService,
    PayslipCalculationEngineService, // NEW
    PdfGeneratorService, // NEW
    EmailTemplateService, // NEW
  ],
  exports: [
    PayrollService,
    GlobalTaxCalculatorService,
    FxConversionService,
    PayrollCalculationService,
    PayslipCalculationEngineService, // NEW
  ],
})
export class PayrollModule {}
