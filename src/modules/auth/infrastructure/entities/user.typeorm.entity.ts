import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { IUserEntity } from '../../application/domain/entities/user.entity.interface';
import { LinkEntityTypeOrm } from '../../../link/infrastructure/entities/link.typeorm.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class UserEntityTypeOrm implements IUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at?: Date;

  @OneToMany(() => LinkEntityTypeOrm, link => link.user)
  links: LinkEntityTypeOrm[];
}
