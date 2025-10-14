import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ConnectorType {
  SCIM = 'SCIM',
  OKTA = 'OKTA',
  AZURE_AD = 'AZURE_AD',
  WORKDAY = 'WORKDAY',
  SUCCESSFACTORS = 'SUCCESSFACTORS',
  SLACK = 'SLACK',
  TEAMS = 'TEAMS',
  BAMBOO_HR = 'BAMBOO_HR',
  CUSTOM_API = 'CUSTOM_API',
}

@Entity('api_connectors')
export class APIConnector extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @Column()
  connectorName: string;

  @Column({
    type: 'enum',
    enum: ConnectorType,
  })
  connectorType: ConnectorType;

  @Column()
  baseUrl: string;

  @Column({ type: 'jsonb' })
  authConfig: {
    type: 'OAUTH2' | 'API_KEY' | 'BASIC' | 'BEARER';
    credentials: Record<string, string>;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  autoSync: boolean;

  @Column({ type: 'int', nullable: true })
  syncIntervalMinutes?: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  syncStatus?: {
    totalRecords?: number;
    successCount?: number;
    errorCount?: number;
    errors?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  fieldMapping?: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
