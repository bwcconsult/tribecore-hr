import { Injectable, Logger } from '@nestjs/common';

export interface IntegrationApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: 'SOURCING' | 'SCREENING' | 'ASSESSMENT' | 'BACKGROUND_CHECK' | 'ONBOARDING' | 'ANALYTICS' | 'COMMUNICATION';
  provider: string;
  logo: string;
  screenshots: string[];
  pricing: {
    model: 'FREE' | 'FREEMIUM' | 'PAID' | 'PER_USE' | 'ENTERPRISE';
    price?: number;
    billingCycle?: 'MONTHLY' | 'ANNUAL' | 'PER_USE';
  };
  features: string[];
  permissions: string[];
  webhookEvents: string[];
  apiEndpoints?: string[];
  setupInstructions: string;
  supportUrl: string;
  documentationUrl: string;
  termsUrl: string;
  privacyUrl: string;
  rating: number;
  reviewCount: number;
  installCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationInstallation {
  id: string;
  appId: string;
  organizationId: string;
  tenantId: string;
  config: Record<string, any>;
  credentials: {
    apiKey?: string;
    accessToken?: string;
    refreshToken?: string;
    webhookSecret?: string;
    [key: string]: any;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'PENDING';
  installedAt: Date;
  installedBy: string;
  lastSyncAt?: Date;
  errorLog?: Array<{
    timestamp: Date;
    error: string;
    context: any;
  }>;
}

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);
  private apps = new Map<string, IntegrationApp>();
  private installations = new Map<string, IntegrationInstallation>();

  constructor() {
    this.loadMarketplaceApps();
  }

  /**
   * Get all marketplace apps
   */
  getMarketplaceApps(filters?: {
    category?: string;
    search?: string;
    pricing?: string;
  }): IntegrationApp[] {
    let apps = Array.from(this.apps.values()).filter(app => app.isActive);

    if (filters?.category) {
      apps = apps.filter(app => app.category === filters.category);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      apps = apps.filter(app =>
        app.name.toLowerCase().includes(search) ||
        app.description.toLowerCase().includes(search)
      );
    }

    if (filters?.pricing) {
      apps = apps.filter(app => app.pricing.model === filters.pricing);
    }

    return apps.sort((a, b) => b.rating - a.rating);
  }

  /**
   * Get single app details
   */
  getApp(appId: string): IntegrationApp | undefined {
    return this.apps.get(appId);
  }

  /**
   * Install app for organization
   */
  async installApp(params: {
    appId: string;
    organizationId: string;
    tenantId: string;
    config: Record<string, any>;
    credentials: Record<string, any>;
    installedBy: string;
  }): Promise<IntegrationInstallation> {
    const app = this.apps.get(params.appId);
    if (!app) {
      throw new Error('App not found');
    }

    // Validate configuration
    this.validateConfig(app, params.config);

    // Test connection
    const isValid = await this.testConnection(app, params.credentials);
    if (!isValid) {
      throw new Error('Connection test failed. Please check your credentials.');
    }

    const installation: IntegrationInstallation = {
      id: `inst_${Date.now()}`,
      appId: params.appId,
      organizationId: params.organizationId,
      tenantId: params.tenantId,
      config: params.config,
      credentials: params.credentials,
      status: 'ACTIVE',
      installedAt: new Date(),
      installedBy: params.installedBy,
    };

    this.installations.set(installation.id, installation);
    
    // Increment install count
    app.installCount++;

    this.logger.log(`App installed: ${app.name} for org ${params.organizationId}`);

    return installation;
  }

  /**
   * Uninstall app
   */
  async uninstallApp(installationId: string): Promise<void> {
    const installation = this.installations.get(installationId);
    if (!installation) {
      throw new Error('Installation not found');
    }

    // Cleanup webhooks
    await this.cleanupWebhooks(installation);

    // Remove data
    this.installations.delete(installationId);

    this.logger.log(`App uninstalled: ${installationId}`);
  }

  /**
   * Update app configuration
   */
  async updateAppConfig(params: {
    installationId: string;
    config?: Record<string, any>;
    credentials?: Record<string, any>;
  }): Promise<IntegrationInstallation> {
    const installation = this.installations.get(params.installationId);
    if (!installation) {
      throw new Error('Installation not found');
    }

    if (params.config) {
      Object.assign(installation.config, params.config);
    }

    if (params.credentials) {
      Object.assign(installation.credentials, params.credentials);
    }

    return installation;
  }

  /**
   * Get installed apps for organization
   */
  getInstalledApps(organizationId: string): Array<IntegrationInstallation & { app: IntegrationApp }> {
    const installations = Array.from(this.installations.values())
      .filter(inst => inst.organizationId === organizationId);

    return installations.map(inst => ({
      ...inst,
      app: this.apps.get(inst.appId)!,
    }));
  }

  /**
   * Trigger app action
   */
  async triggerAction(params: {
    installationId: string;
    action: string;
    data: any;
  }): Promise<any> {
    const installation = this.installations.get(params.installationId);
    if (!installation) {
      throw new Error('Installation not found');
    }

    const app = this.apps.get(installation.appId);
    if (!app) {
      throw new Error('App not found');
    }

    // Execute action based on app type
    return await this.executeAction(app, installation, params.action, params.data);
  }

  /**
   * Sync data from app
   */
  async syncApp(installationId: string): Promise<{
    success: boolean;
    recordsSynced: number;
    errors: any[];
  }> {
    const installation = this.installations.get(installationId);
    if (!installation) {
      throw new Error('Installation not found');
    }

    const app = this.apps.get(installation.appId);
    if (!app) {
      throw new Error('App not found');
    }

    try {
      // Perform sync based on app type
      const result = await this.performSync(app, installation);
      
      installation.lastSyncAt = new Date();
      installation.status = 'ACTIVE';

      return result;
    } catch (error) {
      installation.status = 'ERROR';
      installation.errorLog = installation.errorLog || [];
      installation.errorLog.push({
        timestamp: new Date(),
        error: error.message,
        context: { action: 'sync' },
      });

      return {
        success: false,
        recordsSynced: 0,
        errors: [error.message],
      };
    }
  }

  // Private helper methods

  private loadMarketplaceApps(): void {
    const apps: IntegrationApp[] = [
      {
        id: 'app_linkedin_recruiter',
        name: 'LinkedIn Recruiter',
        slug: 'linkedin-recruiter',
        description: 'Source candidates directly from LinkedIn',
        longDescription: 'Connect your LinkedIn Recruiter account to import profiles, track InMails, and manage your LinkedIn pipeline.',
        category: 'SOURCING',
        provider: 'LinkedIn',
        logo: 'https://logo.clearbit.com/linkedin.com',
        screenshots: [],
        pricing: { model: 'ENTERPRISE' },
        features: [
          'Import LinkedIn profiles',
          'Track InMail responses',
          'Sync candidate notes',
          'Boolean search',
        ],
        permissions: ['read_candidates', 'write_candidates'],
        webhookEvents: ['candidate.imported'],
        setupInstructions: 'Enter your LinkedIn Recruiter API token',
        supportUrl: 'https://linkedin.com/help',
        documentationUrl: 'https://docs.linkedin.com/recruiter',
        termsUrl: 'https://linkedin.com/terms',
        privacyUrl: 'https://linkedin.com/privacy',
        rating: 4.7,
        reviewCount: 234,
        installCount: 1250,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'app_greenhouse',
        name: 'Greenhouse',
        slug: 'greenhouse',
        description: 'Sync with Greenhouse ATS',
        longDescription: 'Bi-directional sync with Greenhouse ATS. Import jobs, candidates, and interview schedules.',
        category: 'SOURCING',
        provider: 'Greenhouse',
        logo: 'https://logo.clearbit.com/greenhouse.io',
        screenshots: [],
        pricing: { model: 'FREE' },
        features: [
          'Import jobs',
          'Sync candidates',
          'Push applications',
          'Sync interview schedules',
        ],
        permissions: ['read_candidates', 'write_candidates', 'read_jobs'],
        webhookEvents: ['candidate.synced', 'job.imported'],
        setupInstructions: 'Enter your Greenhouse API key',
        supportUrl: 'https://greenhouse.io/support',
        documentationUrl: 'https://developers.greenhouse.io',
        termsUrl: 'https://greenhouse.io/terms',
        privacyUrl: 'https://greenhouse.io/privacy',
        rating: 4.8,
        reviewCount: 156,
        installCount: 890,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'app_checkr',
        name: 'Checkr',
        slug: 'checkr',
        description: 'Background check automation',
        longDescription: 'Order background checks with one click. Automated results and compliance tracking.',
        category: 'BACKGROUND_CHECK',
        provider: 'Checkr',
        logo: 'https://logo.clearbit.com/checkr.com',
        screenshots: [],
        pricing: { model: 'PER_USE', price: 35, billingCycle: 'PER_USE' },
        features: [
          'One-click background checks',
          'Automated results',
          'Compliance tracking',
          'Adjudication workflow',
        ],
        permissions: ['read_candidates', 'create_checks'],
        webhookEvents: ['check.completed', 'check.failed'],
        setupInstructions: 'Enter your Checkr API key',
        supportUrl: 'https://checkr.com/support',
        documentationUrl: 'https://docs.checkr.com',
        termsUrl: 'https://checkr.com/terms',
        privacyUrl: 'https://checkr.com/privacy',
        rating: 4.6,
        reviewCount: 445,
        installCount: 2100,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'app_hirevue',
        name: 'HireVue',
        slug: 'hirevue',
        description: 'Video interviewing platform',
        longDescription: 'Conduct one-way and live video interviews with AI-powered assessments.',
        category: 'SCREENING',
        provider: 'HireVue',
        logo: 'https://logo.clearbit.com/hirevue.com',
        screenshots: [],
        pricing: { model: 'PAID', price: 199, billingCycle: 'MONTHLY' },
        features: [
          'One-way video interviews',
          'Live video interviews',
          'AI assessments',
          'Interview scheduling',
        ],
        permissions: ['read_candidates', 'create_interviews'],
        webhookEvents: ['interview.completed', 'assessment.scored'],
        setupInstructions: 'Enter your HireVue account credentials',
        supportUrl: 'https://hirevue.com/support',
        documentationUrl: 'https://docs.hirevue.com',
        termsUrl: 'https://hirevue.com/terms',
        privacyUrl: 'https://hirevue.com/privacy',
        rating: 4.4,
        reviewCount: 312,
        installCount: 1650,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'app_codility',
        name: 'Codility',
        slug: 'codility',
        description: 'Technical assessment platform',
        longDescription: 'Send coding challenges and technical assessments to candidates.',
        category: 'ASSESSMENT',
        provider: 'Codility',
        logo: 'https://logo.clearbit.com/codility.com',
        screenshots: [],
        pricing: { model: 'PAID', price: 149, billingCycle: 'MONTHLY' },
        features: [
          'Coding challenges',
          'Technical assessments',
          'Live pair programming',
          'Automated scoring',
        ],
        permissions: ['read_candidates', 'create_assessments'],
        webhookEvents: ['assessment.completed', 'assessment.scored'],
        setupInstructions: 'Enter your Codility API key',
        supportUrl: 'https://codility.com/support',
        documentationUrl: 'https://docs.codility.com',
        termsUrl: 'https://codility.com/terms',
        privacyUrl: 'https://codility.com/privacy',
        rating: 4.7,
        reviewCount: 567,
        installCount: 1890,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'app_docusign',
        name: 'DocuSign',
        slug: 'docusign',
        description: 'E-signature for offer letters',
        longDescription: 'Send offer letters and contracts for electronic signature.',
        category: 'ONBOARDING',
        provider: 'DocuSign',
        logo: 'https://logo.clearbit.com/docusign.com',
        screenshots: [],
        pricing: { model: 'PAID', price: 25, billingCycle: 'MONTHLY' },
        features: [
          'E-signature',
          'Template management',
          'Audit trail',
          'Mobile signing',
        ],
        permissions: ['read_offers', 'create_documents'],
        webhookEvents: ['document.signed', 'document.declined'],
        setupInstructions: 'Connect your DocuSign account',
        supportUrl: 'https://docusign.com/support',
        documentationUrl: 'https://developers.docusign.com',
        termsUrl: 'https://docusign.com/terms',
        privacyUrl: 'https://docusign.com/privacy',
        rating: 4.9,
        reviewCount: 892,
        installCount: 3450,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    apps.forEach(app => this.apps.set(app.id, app));
  }

  private validateConfig(app: IntegrationApp, config: Record<string, any>): void {
    // TODO: Validate required config fields
  }

  private async testConnection(app: IntegrationApp, credentials: Record<string, any>): Promise<boolean> {
    // TODO: Test connection to external service
    return true;
  }

  private async cleanupWebhooks(installation: IntegrationInstallation): Promise<void> {
    // TODO: Remove webhooks from external service
  }

  private async executeAction(
    app: IntegrationApp,
    installation: IntegrationInstallation,
    action: string,
    data: any
  ): Promise<any> {
    // TODO: Execute app-specific action
    return { success: true };
  }

  private async performSync(
    app: IntegrationApp,
    installation: IntegrationInstallation
  ): Promise<{ success: boolean; recordsSynced: number; errors: any[] }> {
    // TODO: Sync data from external service
    return {
      success: true,
      recordsSynced: 0,
      errors: [],
    };
  }
}
