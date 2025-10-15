import { Injectable, Logger } from '@nestjs/common';

export interface TenantConfiguration {
  tenantId: string;
  tenantName: string;
  subdomain: string;
  customDomain?: string;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily?: string;
    favicon?: string;
  };
  features: {
    aiScoring: boolean;
    videoScreening: boolean;
    backgroundChecks: boolean;
    candidateSourcing: boolean;
    chatbot: boolean;
    analytics: boolean;
    webhooks: boolean;
    customWorkflows: boolean;
  };
  limits: {
    maxRequisitions: number;
    maxApplications: number;
    maxUsers: number;
    maxStorageGB: number;
    apiRateLimit: number; // requests per minute
  };
  integrations: {
    email?: { provider: string; apiKey: string };
    calendar?: { provider: string; credentials: any };
    jobBoards?: string[];
    backgroundCheck?: { provider: string; apiKey: string };
  };
  compliance: {
    dataResidency: 'US' | 'EU' | 'UK' | 'APAC';
    gdprEnabled: boolean;
    ssoEnabled: boolean;
    auditRetentionDays: number;
  };
  billing: {
    plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
    status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
    billingCycle: 'MONTHLY' | 'ANNUAL';
    nextBillingDate?: Date;
    mrr?: number; // Monthly Recurring Revenue
  };
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MultiTenantService {
  private readonly logger = new Logger(MultiTenantService.name);
  private tenants = new Map<string, TenantConfiguration>();

  /**
   * Create new tenant
   */
  async createTenant(params: {
    tenantName: string;
    subdomain: string;
    plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
    adminEmail: string;
    branding?: Partial<TenantConfiguration['branding']>;
  }): Promise<TenantConfiguration> {
    // Check subdomain availability
    const subdomainExists = Array.from(this.tenants.values()).some(
      t => t.subdomain === params.subdomain
    );

    if (subdomainExists) {
      throw new Error('Subdomain already taken');
    }

    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(params.subdomain)) {
      throw new Error('Invalid subdomain format. Use lowercase letters, numbers, and hyphens only.');
    }

    const tenant: TenantConfiguration = {
      tenantId: `tenant_${Date.now()}`,
      tenantName: params.tenantName,
      subdomain: params.subdomain,
      branding: {
        primaryColor: params.branding?.primaryColor || '#3b82f6',
        secondaryColor: params.branding?.secondaryColor || '#10b981',
        logo: params.branding?.logo,
        fontFamily: params.branding?.fontFamily || 'Inter, sans-serif',
        favicon: params.branding?.favicon,
      },
      features: this.getFeaturesForPlan(params.plan),
      limits: this.getLimitsForPlan(params.plan),
      integrations: {},
      compliance: {
        dataResidency: 'US',
        gdprEnabled: true,
        ssoEnabled: params.plan === 'ENTERPRISE',
        auditRetentionDays: params.plan === 'ENTERPRISE' ? 2555 : 365, // 7 years for enterprise
      },
      billing: {
        plan: params.plan,
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        mrr: this.getPlanMRR(params.plan),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tenants.set(tenant.tenantId, tenant);
    this.logger.log(`Tenant created: ${tenant.tenantId} (${params.subdomain})`);

    return tenant;
  }

  /**
   * Get tenant by ID
   */
  getTenant(tenantId: string): TenantConfiguration | undefined {
    return this.tenants.get(tenantId);
  }

  /**
   * Get tenant by subdomain
   */
  getTenantBySubdomain(subdomain: string): TenantConfiguration | undefined {
    return Array.from(this.tenants.values()).find(t => t.subdomain === subdomain);
  }

  /**
   * Get tenant by custom domain
   */
  getTenantByDomain(domain: string): TenantConfiguration | undefined {
    return Array.from(this.tenants.values()).find(t => t.customDomain === domain);
  }

  /**
   * Update tenant configuration
   */
  async updateTenant(
    tenantId: string,
    updates: Partial<TenantConfiguration>
  ): Promise<TenantConfiguration> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    Object.assign(tenant, updates);
    tenant.updatedAt = new Date();

    return tenant;
  }

  /**
   * Update tenant branding
   */
  async updateBranding(
    tenantId: string,
    branding: Partial<TenantConfiguration['branding']>
  ): Promise<TenantConfiguration> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    Object.assign(tenant.branding, branding);
    tenant.updatedAt = new Date();

    return tenant;
  }

  /**
   * Set custom domain
   */
  async setCustomDomain(tenantId: string, domain: string): Promise<TenantConfiguration> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Verify domain ownership (in production, require DNS verification)
    // await this.verifyDomainOwnership(domain);

    tenant.customDomain = domain;
    tenant.updatedAt = new Date();

    this.logger.log(`Custom domain set for tenant ${tenantId}: ${domain}`);
    return tenant;
  }

  /**
   * Upgrade/downgrade tenant plan
   */
  async changePlan(
    tenantId: string,
    newPlan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  ): Promise<TenantConfiguration> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const oldPlan = tenant.billing.plan;

    // Update features and limits
    tenant.features = this.getFeaturesForPlan(newPlan);
    tenant.limits = this.getLimitsForPlan(newPlan);
    tenant.billing.plan = newPlan;
    tenant.billing.mrr = this.getPlanMRR(newPlan);

    // Update SSO availability
    tenant.compliance.ssoEnabled = newPlan === 'ENTERPRISE';

    tenant.updatedAt = new Date();

    this.logger.log(`Tenant ${tenantId} plan changed: ${oldPlan} → ${newPlan}`);
    return tenant;
  }

  /**
   * Suspend tenant (non-payment, violation, etc.)
   */
  async suspendTenant(tenantId: string, reason: string): Promise<void> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    tenant.billing.status = 'SUSPENDED';
    tenant.metadata = tenant.metadata || {};
    tenant.metadata.suspensionReason = reason;
    tenant.metadata.suspendedAt = new Date();

    this.logger.warn(`Tenant suspended: ${tenantId} - ${reason}`);
  }

  /**
   * Reactivate suspended tenant
   */
  async reactivateTenant(tenantId: string): Promise<void> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    tenant.billing.status = 'ACTIVE';
    if (tenant.metadata) {
      delete tenant.metadata.suspensionReason;
      delete tenant.metadata.suspendedAt;
    }

    this.logger.log(`Tenant reactivated: ${tenantId}`);
  }

  /**
   * Check if tenant has feature enabled
   */
  hasFeature(tenantId: string, feature: keyof TenantConfiguration['features']): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    return tenant.features[feature] === true;
  }

  /**
   * Check if tenant is within limits
   */
  isWithinLimits(
    tenantId: string,
    resource: keyof TenantConfiguration['limits'],
    currentUsage: number
  ): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    return currentUsage < tenant.limits[resource];
  }

  /**
   * Get usage statistics for tenant
   */
  async getUsageStats(tenantId: string): Promise<{
    requisitions: { current: number; limit: number; percentage: number };
    applications: { current: number; limit: number; percentage: number };
    users: { current: number; limit: number; percentage: number };
    storage: { currentGB: number; limitGB: number; percentage: number };
  }> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // In production, query actual usage from database
    const mockUsage = {
      requisitions: { current: 15, limit: tenant.limits.maxRequisitions, percentage: 0 },
      applications: { current: 250, limit: tenant.limits.maxApplications, percentage: 0 },
      users: { current: 8, limit: tenant.limits.maxUsers, percentage: 0 },
      storage: { currentGB: 2.5, limitGB: tenant.limits.maxStorageGB, percentage: 0 },
    };

    // Calculate percentages
    mockUsage.requisitions.percentage = (mockUsage.requisitions.current / mockUsage.requisitions.limit) * 100;
    mockUsage.applications.percentage = (mockUsage.applications.current / mockUsage.applications.limit) * 100;
    mockUsage.users.percentage = (mockUsage.users.current / mockUsage.users.limit) * 100;
    mockUsage.storage.percentage = (mockUsage.storage.currentGB / mockUsage.storage.limitGB) * 100;

    return mockUsage;
  }

  /**
   * List all tenants (admin only)
   */
  listAllTenants(filters?: {
    plan?: string;
    status?: string;
  }): TenantConfiguration[] {
    let tenants = Array.from(this.tenants.values());

    if (filters?.plan) {
      tenants = tenants.filter(t => t.billing.plan === filters.plan);
    }

    if (filters?.status) {
      tenants = tenants.filter(t => t.billing.status === filters.status);
    }

    return tenants;
  }

  // Private helper methods

  private getFeaturesForPlan(plan: string): TenantConfiguration['features'] {
    const features: Record<string, TenantConfiguration['features']> = {
      FREE: {
        aiScoring: false,
        videoScreening: false,
        backgroundChecks: false,
        candidateSourcing: false,
        chatbot: false,
        analytics: true,
        webhooks: false,
        customWorkflows: false,
      },
      STARTER: {
        aiScoring: true,
        videoScreening: false,
        backgroundChecks: true,
        candidateSourcing: false,
        chatbot: true,
        analytics: true,
        webhooks: true,
        customWorkflows: false,
      },
      PROFESSIONAL: {
        aiScoring: true,
        videoScreening: true,
        backgroundChecks: true,
        candidateSourcing: true,
        chatbot: true,
        analytics: true,
        webhooks: true,
        customWorkflows: true,
      },
      ENTERPRISE: {
        aiScoring: true,
        videoScreening: true,
        backgroundChecks: true,
        candidateSourcing: true,
        chatbot: true,
        analytics: true,
        webhooks: true,
        customWorkflows: true,
      },
    };

    return features[plan] || features.FREE;
  }

  private getLimitsForPlan(plan: string): TenantConfiguration['limits'] {
    const limits: Record<string, TenantConfiguration['limits']> = {
      FREE: {
        maxRequisitions: 5,
        maxApplications: 100,
        maxUsers: 2,
        maxStorageGB: 1,
        apiRateLimit: 100,
      },
      STARTER: {
        maxRequisitions: 25,
        maxApplications: 1000,
        maxUsers: 10,
        maxStorageGB: 10,
        apiRateLimit: 1000,
      },
      PROFESSIONAL: {
        maxRequisitions: 100,
        maxApplications: 10000,
        maxUsers: 50,
        maxStorageGB: 100,
        apiRateLimit: 5000,
      },
      ENTERPRISE: {
        maxRequisitions: 999999,
        maxApplications: 999999,
        maxUsers: 999999,
        maxStorageGB: 1000,
        apiRateLimit: 20000,
      },
    };

    return limits[plan] || limits.FREE;
  }

  private getPlanMRR(plan: string): number {
    const pricing: Record<string, number> = {
      FREE: 0,
      STARTER: 99,
      PROFESSIONAL: 499,
      ENTERPRISE: 1999,
    };

    return pricing[plan] || 0;
  }

  private async verifyDomainOwnership(domain: string): Promise<boolean> {
    // TODO: Implement DNS verification
    // 1. Generate verification token
    // 2. Require customer to add TXT record
    // 3. Query DNS to verify record exists
    // 4. Setup SSL certificate (Let's Encrypt)
    return true;
  }
}
