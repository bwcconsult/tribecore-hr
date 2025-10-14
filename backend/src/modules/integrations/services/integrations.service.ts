import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook, WebhookEvent } from '../entities/webhook.entity';
import { APIConnector } from '../entities/api-connector.entity';
import axios from 'axios';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepo: Repository<Webhook>,
    @InjectRepository(APIConnector)
    private readonly connectorRepo: Repository<APIConnector>,
  ) {}

  async createWebhook(data: Partial<Webhook>): Promise<Webhook> {
    return this.webhookRepo.save(data);
  }

  async triggerWebhook(organizationId: string, event: WebhookEvent, payload: any): Promise<void> {
    const webhooks = await this.webhookRepo.find({
      where: { organizationId, isActive: true },
    });

    for (const webhook of webhooks) {
      if (webhook.events.includes(event)) {
        try {
          await axios.post(webhook.targetUrl, {
            event,
            timestamp: new Date().toISOString(),
            data: payload,
          }, {
            headers: webhook.headers || {},
          });

          webhook.successCount += 1;
          webhook.lastTriggeredAt = new Date();
        } catch (error) {
          webhook.failureCount += 1;
        }
        await this.webhookRepo.save(webhook);
      }
    }
  }

  async createConnector(data: Partial<APIConnector>): Promise<APIConnector> {
    return this.connectorRepo.save(data);
  }

  async getConnectors(organizationId: string): Promise<APIConnector[]> {
    return this.connectorRepo.find({
      where: { organizationId },
    });
  }

  async syncConnector(connectorId: string): Promise<any> {
    const connector = await this.connectorRepo.findOne({ where: { id: connectorId } });
    if (!connector) throw new Error('Connector not found');

    // Implementation would call external API based on connector type
    connector.lastSyncAt = new Date();
    await this.connectorRepo.save(connector);

    return { status: 'synced', message: 'Connector synced successfully' };
  }
}
