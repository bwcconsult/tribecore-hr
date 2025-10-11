import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';

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

// Services
import { ExpenseClaimService } from './services/expense-claim.service';
import { ApprovalService } from './services/approval.service';
import { PolicyService } from './services/policy.service';
import { ReimbursementService } from './services/reimbursement.service';
import { AuditTrailService } from './services/audit-trail.service';
import { AnalyticsService } from './services/analytics.service';
import { OcrService } from './services/ocr.service';
import { StorageService } from './services/storage.service';

// Controllers
import { ExpenseClaimController } from './controllers/expense-claim.controller';
import { ApprovalController } from './controllers/approval.controller';
import { ReimbursementController } from './controllers/reimbursement.controller';
import { CategoryController } from './controllers/category.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { ReceiptController } from './controllers/receipt.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpenseClaim,
      ExpenseItem,
      ExpenseCategory,
      Receipt,
      Approval,
      PolicyRule,
      Reimbursement,
      AuditTrail,
      Budget,
    ]),
    NotificationsModule,
  ],
  controllers: [
    ExpenseClaimController,
    ApprovalController,
    ReimbursementController,
    CategoryController,
    AnalyticsController,
    ReceiptController,
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
