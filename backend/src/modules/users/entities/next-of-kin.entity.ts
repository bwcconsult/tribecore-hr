import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NextOfKinRelationship {
  SPOUSE = 'SPOUSE',
  PARTNER = 'PARTNER',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  GRANDPARENT = 'GRANDPARENT',
  GRANDCHILD = 'GRANDCHILD',
  AUNT_UNCLE = 'AUNT_UNCLE',
  NIECE_NEPHEW = 'NIECE_NEPHEW',
  COUSIN = 'COUSIN',
  FRIEND = 'FRIEND',
  GUARDIAN = 'GUARDIAN',
  OTHER = 'OTHER',
}

@Entity('next_of_kin')
export class NextOfKin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: NextOfKinRelationship,
  })
  relationship: NextOfKinRelationship;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column()
  postcode: string;

  @Column()
  country: string;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
