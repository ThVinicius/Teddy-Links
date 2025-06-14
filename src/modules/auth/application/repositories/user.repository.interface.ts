import { IUserEntity } from '../domain/entities/user.entity.interface';
import { ICreateUser } from '../types/create-user.type';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUserEntity | null>;
  create(user: ICreateUser): Promise<IUserEntity>;
}
