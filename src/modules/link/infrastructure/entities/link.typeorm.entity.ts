import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { ILinkEntity } from '../../application/domain/entities/link.entity.interface';
import { UserEntityTypeOrm } from '../../../auth/infrastructure/entities/user.typeorm.entity';

@Entity({ name: 'links' })
export class LinkEntityTypeOrm implements ILinkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 6, unique: true })
  short_code: string;

  @Column()
  original_url: string;

  @Column({ default: 0 })
  click_count: number;

  @Column({ nullable: true })
  user_id: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at?: Date;

  @ManyToOne(() => UserEntityTypeOrm, user => user.links)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntityTypeOrm;
}
