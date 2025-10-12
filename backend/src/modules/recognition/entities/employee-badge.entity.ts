import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('employee_badges')
export class EmployeeBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  badgeId: string;

  @Column()
  awardedBy: string;

  @Column({ nullable: true })
  recognitionId: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  awardedAt: Date;
}
