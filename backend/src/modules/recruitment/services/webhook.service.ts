import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';

export enum WebhookEvent {
  // Requisition events
  REQUISITION_CREATED = 'requisition.created',
  REQUISITION_APPROVED = 'requisition.approved',
  REQUISITION_REJECTED = 'requisition.rejected',
  REQUISITION_FILLED = 'requisition.filled',
  
  // Application events
  APPLICATION_CREATED = 'application.created',
  APPLICATION_STAGE_CHANGED = 'application.stage_changed',
  APPLICATION_REJECTED = 'application.rejected',
  APPLICATION_SCORED = 'application.scored',
  
  // Interview events
  INTERVIEW_SCHEDULED = 'interview.scheduled',
  INTERVIEW_RESCHEDULED = 'interview.rescheduled',
  INTERVIEW_CANCELLED = 'interview.cancelled',
  INTERVIEW_COMPLETED = 'interview.completed',
  
  // Scorecard events
  SCORECARD_SUBMITTED = 'scorecard.submitted',
  SCORECARD_OVERDUE = 'scorecard.overdue',
  
  // Offer events
  OFFER_CREATED = 'offer.created',
  OFFER_SENT = 'offer.sent',
  OFFER_ACCEPTED = 'offer.accepted',
  OFFER_DECLINED = 'offer.declined',
  
  // Check events
  CHECK_INITIATED = 'check.initiated',
  CHECK_COMPLETED = 'check.completed',
  CHECK_FAILED = 'check.failed',
  
  // Candidate events
  CANDIDATE_CREATED = 'candidate.created',
  CANDIDATE_UPDATED = 'candidate.updated',
  CANDIDATE_ANONYMIZED = 'candidate.anonymized',
}

export interface WebhookSubscription {
  id: string;
  organizationId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  metadata?: any;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  organizationId: string;
  data: any;
  metadata?: any;
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  url: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempts: number;
  lastAttemptAt?: Date;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private subscriptions = new Map<string, WebhookSubscription>();
  private deliveryQueue: WebhookDelivery[] = [];

  /**
   * Create webhook subscription
   */
  async createSubscription(params: {
    organizationId: string;
    url: string;
    events: WebhookEvent[];
    metadata?: any;
  }): Promise<WebhookSubscription> {
    // Validate URL
    if (!this.isValidUrl(params.url)) {
      throw new Error('Invalid webhook URL');
    }

    // Generate secret for signature verification
    const secret = this.generateSecret();

    const subscription: WebhookSubscription = {
      id: `sub_${Date.now()}`,
      organizationId: params.organizationId,
      url: params.url,
      events: params.events,
      secret,
      isActive: true,
      metadata: params.metadata,
      createdAt: new Date(),
      failureCount: 0,
    };

    this.subscriptions.set(subscription.id, subscription);
    this.logger.log(`Webhook subscription created: ${subscription.id}`);

    return subscription;
  }

  /**
   * Trigger webhook for event
   */
  async triggerWebhook(params: {
    organizationId: string;
    event: WebhookEvent;
    data: any;
    metadata?: any;
  }): Promise<void> {
    const payload: WebhookPayload = {
      event: params.event,
      timestamp: new Date(),
      organizationId: params.organizationId,
      data: params.data,
      metadata: params.metadata,
    };

    // Find subscriptions for this org and event
    const subscriptions = Array.from(this.subscriptions.values()).filter(
      sub =>
        sub.organizationId === params.organizationId &&
        sub.isActive &&
        sub.events.includes(params.event)
    );

    if (subscriptions.length === 0) {
      this.logger.debug(`No webhook subscriptions for event: ${params.event}`);
      return;
    }

    // Queue deliveries
    for (const subscription of subscriptions) {
      const delivery: WebhookDelivery = {
        id: `del_${Date.now()}_${Math.random()}`,
        subscriptionId: subscription.id,
        event: params.event,
        payload,
        url: subscription.url,
        status: 'pending',
        attempts: 0,
      };

      this.deliveryQueue.push(delivery);
      subscription.lastTriggeredAt = new Date();
    }

    // Process queue asynchronously
    this.processDeliveryQueue();
  }

  /**
   * Delete webhook subscription
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    this.subscriptions.delete(subscriptionId);
    this.logger.log(`Webhook subscription deleted: ${subscriptionId}`);
  }

  /**
   * Update webhook subscription
   */
  async updateSubscription(params: {
    subscriptionId: string;
    url?: string;
    events?: WebhookEvent[];
    isActive?: boolean;
  }): Promise<WebhookSubscription> {
    const subscription = this.subscriptions.get(params.subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (params.url) subscription.url = params.url;
    if (params.events) subscription.events = params.events;
    if (params.isActive !== undefined) subscription.isActive = params.isActive;

    return subscription;
  }

  /**
   * Get subscription
   */
  getSubscription(subscriptionId: string): WebhookSubscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * List subscriptions for organization
   */
  listSubscriptions(organizationId: string): WebhookSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      sub => sub.organizationId === organizationId
    );
  }

  /**
   * Verify webhook signature
   */
  verifySignature(params: {
    payload: string;
    signature: string;
    secret: string;
  }): boolean {
    const expectedSignature = this.generateSignature(params.payload, params.secret);
    return params.signature === expectedSignature;
  }

  /**
   * Generate signature for payload
   */
  generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  // Private helper methods

  private async processDeliveryQueue(): Promise<void> {
    const delivery = this.deliveryQueue.shift();
    if (!delivery) return;

    try {
      await this.deliverWebhook(delivery);
    } catch (error) {
      this.logger.error(`Webhook delivery failed: ${error.message}`);
      
      // Retry logic
      if (delivery.attempts < 3) {
        delivery.status = 'retrying';
        delivery.attempts++;
        
        // Exponential backoff: 1min, 5min, 15min
        const delayMs = Math.pow(5, delivery.attempts) * 60 * 1000;
        setTimeout(() => {
          this.deliveryQueue.push(delivery);
          this.processDeliveryQueue();
        }, delayMs);
      } else {
        delivery.status = 'failed';
        
        // Increment failure count and potentially disable subscription
        const subscription = this.subscriptions.get(delivery.subscriptionId);
        if (subscription) {
          subscription.failureCount++;
          if (subscription.failureCount >= 10) {
            subscription.isActive = false;
            this.logger.warn(`Webhook subscription disabled due to failures: ${subscription.id}`);
          }
        }
      }
    }

    // Continue processing queue
    if (this.deliveryQueue.length > 0) {
      setImmediate(() => this.processDeliveryQueue());
    }
  }

  private async deliverWebhook(delivery: WebhookDelivery): Promise<void> {
    const subscription = this.subscriptions.get(delivery.subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    delivery.attempts++;
    delivery.lastAttemptAt = new Date();

    const payloadString = JSON.stringify(delivery.payload);
    const signature = this.generateSignature(payloadString, subscription.secret);

    try {
      const response = await fetch(delivery.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': delivery.event,
          'X-Webhook-Delivery-ID': delivery.id,
          'User-Agent': 'TribeCore-Webhooks/1.0',
        },
        body: payloadString,
      });

      delivery.responseStatus = response.status;
      delivery.responseBody = await response.text();

      if (response.ok) {
        delivery.status = 'success';
        subscription.failureCount = 0; // Reset on success
        this.logger.log(`Webhook delivered successfully: ${delivery.id}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${delivery.responseBody}`);
      }
    } catch (error) {
      delivery.status = 'failed';
      delivery.error = error.message;
      throw error;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }

  private generateSecret(): string {
    return createHmac('sha256', Date.now().toString())
      .update(Math.random().toString())
      .digest('hex');
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(subscriptionId: string): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const testPayload: WebhookPayload = {
      event: WebhookEvent.APPLICATION_CREATED,
      timestamp: new Date(),
      organizationId: subscription.organizationId,
      data: { test: true, message: 'This is a test webhook' },
    };

    const delivery: WebhookDelivery = {
      id: `test_${Date.now()}`,
      subscriptionId: subscription.id,
      event: WebhookEvent.APPLICATION_CREATED,
      payload: testPayload,
      url: subscription.url,
      status: 'pending',
      attempts: 0,
    };

    try {
      await this.deliverWebhook(delivery);
      return true;
    } catch (error) {
      this.logger.error(`Test webhook failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get delivery history for subscription
   */
  getDeliveryHistory(subscriptionId: string, limit = 50): WebhookDelivery[] {
    // In production, this would query from database
    // For now, return empty array
    return [];
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryId: string): Promise<void> {
    // In production, fetch from database and retry
    this.logger.log(`Retrying webhook delivery: ${deliveryId}`);
  }
}
