import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntityTypeOrm } from '../entities/user.typeorm.entity';
import { IUserRepository } from '../../application/repositories/user.repository.interface';
import { IUserEntity } from '../../application/domain/entities/user.entity.interface';
import { ICreateUser } from '../../application/types/create-user.type';

export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntityTypeOrm)
    readonly repository: Repository<UserEntityTypeOrm>
  ) {}

  async findByEmail(email: string): Promise<IUserEntity | null> {
    return await this.repository.findOne({
      where: { email }
    });
  }

  create(user: ICreateUser): Promise<IUserEntity> {
    const userEntity = this.repository.create(user);
    return this.repository.save(userEntity);
  }
}
