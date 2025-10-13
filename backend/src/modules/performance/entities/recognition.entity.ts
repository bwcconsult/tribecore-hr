import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum RecognitionBadge {
  CUSTOMER_FIRST = 'CUSTOMER_FIRST',
  INNOVATION = 'INNOVATION',
  TEAM_PLAYER = 'TEAM_PLAYER',
  OWNERSHIP = 'OWNERSHIP',
  CRAFT_EXCELLENCE = 'CRAFT_EXCELLENCE',
  EFFECTIVE_COMMUNICATOR = 'EFFECTIVE_COMMUNICATOR',
  CONTINUOUS_GROWTH = 'CONTINUOUS_GROWTH',
  PROBLEM_SOLVER = 'PROBLEM_SOLVER',
  LEADERSHIP = 'LEADERSHIP',
  ABOVE_AND_BEYOND = 'ABOVE_AND_BEYOND',
}

@Entity('recognition')
export class Recognition extends BaseEntity {
  @Column()
  fromUserId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'fromUserId' })
  fromUser: Employee;

  @Column()
  toUserId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'toUserId' })
  toUser: Employee;

  @Column({
    type: 'enum',
    enum: RecognitionBadge,
  })
  badge: RecognitionBadge;

  @Column({ type: 'text' })
  text: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ type: 'simple-array', nullable: true })
  values: string[]; // Tied to company values

  @Column({ nullable: true })
  relatedObjectiveId: string;

  @Column({ nullable: true })
  relatedProjectId: string;

  @Column({ type: 'simple-array', nullable: true })
  witnesses: string[]; // Other employee IDs who can vouch

  @Column({ default: 0 })
  reactions: number; // Number of likes/reactions

  @Column({ type: 'simple-json', nullable: true })
  reactionDetails: { userId: string; emoji: string; timestamp: Date }[];

  @Column({ default: false })
  sharedToSlack: boolean;

  @Column({ default: false })
  sharedToTeams: boolean;

  @Column({ default: false })
  includedInNewsletter: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    impactLevel?: 'TEAM' | 'DEPARTMENT' | 'COMPANY';
    category?: string;
  };
}
