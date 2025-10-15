import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum NoteVisibility {
  INTERNAL = 'internal',
  SHARED = 'shared', // Shared with client (for customer onboarding)
}

@Entity('onboarding_notes')
@Index(['objectType', 'objectId', 'createdAt'])
export class Note extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  objectType: string; // 'OnboardingCase', 'ClientOnboardingCase', 'OnboardingTask', 'CO_Task', etc.

  @Column()
  objectId: string; // ID of the related object

  @Column()
  authorId: string; // User who created the note

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', default: [] })
  mentions: string[]; // User IDs mentioned with @

  @Column({
    type: 'enum',
    enum: NoteVisibility,
    default: NoteVisibility.INTERNAL,
  })
  visibility: NoteVisibility;

  @Column({ default: false })
  pinned: boolean;

  @Column({ type: 'jsonb', default: [] })
  attachments: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;

  @Column({ nullable: true })
  parentNoteId: string; // For threading/replies

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    tags?: string[];
    priority?: string;
    [key: string]: any;
  };
}
