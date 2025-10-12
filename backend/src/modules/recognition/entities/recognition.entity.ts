import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RecognitionType {
  PEER_TO_PEER = 'PEER_TO_PEER',
  MANAGER = 'MANAGER',
  TEAM = 'TEAM',
  COMPANY_WIDE = 'COMPANY_WIDE',
}

export enum RecognitionCategory {
  EXCELLENCE = 'EXCELLENCE',
  INNOVATION = 'INNOVATION',
  TEAMWORK = 'TEAMWORK',
  LEADERSHIP = 'LEADERSHIP',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  GOING_ABOVE_BEYOND = 'GOING_ABOVE_BEYOND',
  MILESTONE = 'MILESTONE',
  MONTHLY_AWARD = 'MONTHLY_AWARD',
}

@Entity('recognitions')
export class Recognition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  recipientId: string;

  @Column()
  giverId: string;

  @Column({
    type: 'enum',
    enum: RecognitionType,
  })
  type: RecognitionType;

  @Column({
    type: 'enum',
    enum: RecognitionCategory,
  })
  category: RecognitionCategory;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'simple-array', nullable: true })
  likedBy: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  badgeId: string;

  @Column({ type: 'int', default: 0 })
  pointsAwarded: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    projectName?: string;
    teamMembers?: string[];
    attachments?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
