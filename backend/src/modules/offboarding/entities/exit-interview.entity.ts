import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('exit_interviews')
export class ExitInterview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  offboardingProcessId: string;

  @Column()
  employeeId: string;

  @Column()
  conductedBy: string;

  @Column()
  interviewDate: Date;

  @Column({ type: 'int', nullable: true })
  overallSatisfactionRating: number; // 1-10

  @Column({ type: 'jsonb', nullable: true })
  ratings: {
    workEnvironment?: number;
    management?: number;
    careerDevelopment?: number;
    compensation?: number;
    workLifeBalance?: number;
    teamCollaboration?: number;
  };

  @Column({ type: 'text', nullable: true })
  reasonForLeaving: string;

  @Column({ type: 'text', nullable: true })
  whatWentWell: string;

  @Column({ type: 'text', nullable: true })
  areasForImprovement: string;

  @Column({ type: 'text', nullable: true })
  wouldRecommendCompany: string;

  @Column({ type: 'text', nullable: true })
  additionalComments: string;

  @Column({ default: false })
  wouldRehire: boolean;

  @Column({ default: false })
  openToReturning: boolean;

  @Column({ type: 'simple-array', nullable: true })
  improvementSuggestions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
