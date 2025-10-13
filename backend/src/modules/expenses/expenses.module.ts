import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

// Entities
import { ExpenseClaim } from './entities/expense-claim.entity';
import { ExpenseItem } from './entities/expense-item.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { Receipt } from './entities/receipt.entity';
import { Approval } from './entities/approval.entity';
import { PolicyRule } from './entities/policy-rule.entity';
import { Reimbursement } from './entities/reimbursement.entity';
import { AuditTrail } from './entities/audit-trail.entity';
import { Budget } from './entities/budget.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { ApprovalRule } from './entities/approval-rule.entity';
import { TaxCode } from './entities/tax-code.entity';
import { Currency } from './entities/currency.entity';
import { Project } from './entities/project.entity';
import { CorpCardTxn } from './entities/corp-card-txn.entity';
import { Expense } from './entities/expense.entity';
import { User } from '../users/entities/user.entity';
import { Trip } from './entities/trip.entity';
import { Mileage } from './entities/mileage.entity';
import { ExpenseDelegate } from './entities/delegate.entity';
import { ExpenseOutOfOffice } from './entities/out-of-office.entity';
import { Advance } from './entities/advance.entity';
import { BatchPayment } from './entities/batch-payment.entity';

// Services
import { ExpenseClaimService } from './services/expense-claim.service';
import { ApprovalService } from './services/approval.service';
import { PolicyService } from './services/policy.service';
import { ReimbursementService } from './services/reimbursement.service';
import { AuditTrailService } from './services/audit-trail.service';
import { AnalyticsService } from './services/analytics.service';
import { OcrService } from './services/ocr.service';
import { StorageService } from './services/storage.service';
import { CurrencyService } from './services/currency.service';
import { WorkflowService } from './services/workflow.service';
import { ForecastService } from './services/forecast.service';
import { TripService } from './services/trip.service';
import { MileageService } from './services/mileage.service';
import { DelegateService } from './services/delegate.service';
import { AdvanceService } from './services/advance.service';
import { BatchPaymentService } from './services/batch-payment.service';
import { AdminDashboardService } from './services/admin-dashboard.service';

// Controllers
import { ExpenseClaimController } from './controllers/expense-claim.controller';
import { ApprovalController } from './controllers/approval.controller';
import { ReimbursementController } from './controllers/reimbursement.controller';
import { CategoryController } from './controllers/category.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { ReceiptController } from './controllers/receipt.controller';
import { CurrencyController } from './controllers/currency.controller';
import { WorkflowController } from './controllers/workflow.controller';
import { ForecastController } from './controllers/forecast.controller';
import { ExpensesApiController } from './controllers/expenses-api.controller';
import { ReceiptsUploadController } from './controllers/receipts-upload.controller';
import { CorpCardController } from './controllers/corp-card.controller';
import { TripController } from './controllers/trip.controller';
import { MileageController } from './controllers/mileage.controller';
import { DelegateController } from './controllers/delegate.controller';
import { AdvanceController } from './controllers/advance.controller';
import { BatchPaymentController } from './controllers/batch-payment.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      ExpenseClaim,
      ExpenseItem,
      ExpenseCategory,
      Receipt,
      Approval,
      PolicyRule,
      Reimbursement,
      AuditTrail,
      Budget,
      ExchangeRate,
      ApprovalRule,
      TaxCode,
      Currency,
      Project,
      CorpCardTxn,
      User,
      Trip,
      Mileage,
      ExpenseDelegate,
      ExpenseOutOfOffice,
      Advance,
      BatchPayment,
    ]),
    NotificationsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [
    ExpenseClaimController,
    ApprovalController,
    ReimbursementController,
    CategoryController,
    AnalyticsController,
    ReceiptController,
    CurrencyController,
    WorkflowController,
    ForecastController,
    ExpensesApiController,
    ReceiptsUploadController,
    CorpCardController,
    TripController,
    MileageController,
    DelegateController,
    AdvanceController,
    BatchPaymentController,
    AdminDashboardController,
  ],
  providers: [
    ExpenseClaimService,
    ApprovalService,
    PolicyService,
    ReimbursementService,
    AuditTrailService,
    AnalyticsService,
    OcrService,
    StorageService,
    CurrencyService,
    WorkflowService,
    ForecastService,
    TripService,
    MileageService,
    DelegateService,
    AdvanceService,
    BatchPaymentService,
    AdminDashboardService,
  ],
  exports: [
    ExpenseClaimService,
    ApprovalService,
    PolicyService,
    ReimbursementService,
    AuditTrailService,
  ],
})
export class ExpensesModule {}
