import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  SLACK = 'SLACK',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export enum NotificationFrequency {
  INSTANT = 'INSTANT',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

@Entity('recruitment_watchers')
@Index(['objectType', 'objectId'])
@Index(['userId'])
export class Watcher extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  objectType: string; // REQUISITION, APPLICATION, INTERVIEW, OFFER

  @Column()
  objectId: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  // Auto-assigned vs manually subscribed
  @Column({ default: false })
  isAutoAssigned: boolean; // Creator, owner, assigned recruiter, etc.

  @Column({ nullable: true })
  assignmentReason: string; // CREATOR, OWNER, HIRING_MANAGER, INTERVIEWER, RECRUITER

  // Notification preferences
  @Column({ type: 'jsonb', default: ['EMAIL', 'IN_APP'] })
  channels: NotificationChannel[];

  @Column({
    type: 'enum',
    enum: NotificationFrequency,
    default: NotificationFrequency.INSTANT,
  })
  frequency: NotificationFrequency;

  // Event filters (what to notify about)
  @Column({ type: 'jsonb', nullable: true })
  eventFilters: {
    includeEvents?: string[]; // Specific events to watch
    excludeEvents?: string[]; // Events to ignore
    onlyMentions?: boolean; // Only notify on @mentions
    onlyUrgent?: boolean; // Only HIGH/URGENT priority
  };

  // Active status
  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  mutedUntil: Date; // Temporarily mute

  @Column({ type: 'timestamp', nullable: true })
  lastNotifiedAt: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    unreadCount?: number;
    lastViewedAt?: Date;
    [key: string]: any;
  };

  /**
   * Check if should notify
   */
  shouldNotify(event: string, isMention: boolean, isUrgent: boolean): boolean {
    if (!this.isActive) return false;
    if (this.mutedUntil && new Date() < this.mutedUntil) return false;

    if (this.eventFilters) {
      if (this.eventFilters.onlyMentions && !isMention) return false;
      if (this.eventFilters.onlyUrgent && !isUrgent) return false;
      if (this.eventFilters.includeEvents && !this.eventFilters.includeEvents.includes(event)) return false;
      if (this.eventFilters.excludeEvents && this.eventFilters.excludeEvents.includes(event)) return false;
    }

    return true;
  }

  /**
   * Mute for duration
   */
  mute(durationHours: number): void {
    this.mutedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  }
}
