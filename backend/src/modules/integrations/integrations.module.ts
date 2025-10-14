import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from './entities/webhook.entity';
import { APIConnector } from './entities/api-connector.entity';
import { IntegrationsService } from './services/integrations.service';
import { IntegrationsController } from './controllers/integrations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Webhook, APIConnector]),
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
