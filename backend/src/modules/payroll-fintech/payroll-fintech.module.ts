import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { PayrollWallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/transaction.entity';
import { EWARequest } from './entities/ewa-request.entity';
import { InstantPayRequest } from './entities/instant-pay-request.entity';
import { PaymentRail } from './entities/payment-rail.entity';
import { FintechConfig } from './entities/fintech-config.entity';

// Services
import { WalletService } from './services/wallet.service';
import { EWAService } from './services/ewa.service';
import { InstantPayService } from './services/instant-pay.service';

// Controllers
import { WalletController } from './controllers/wallet.controller';
import { EWAController } from './controllers/ewa.controller';
import { InstantPayController } from './controllers/instant-pay.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PayrollWallet,
      WalletTransaction,
      EWARequest,
      InstantPayRequest,
      PaymentRail,
      FintechConfig,
    ]),
  ],
  controllers: [
    WalletController,
    EWAController,
    InstantPayController,
  ],
  providers: [
    WalletService,
    EWAService,
    InstantPayService,
  ],
  exports: [
    WalletService,
    EWAService,
    InstantPayService,
  ],
})
export class PayrollFintechModule {}
