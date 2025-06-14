import { BusinessError } from '../../../link/application/errors/business.error';
import { HashLib } from '../../infrastructure/libs/hash.lib';
import { IUserRepository } from '../repositories/user.repository.interface';
import { ICreateUser } from '../types/create-user.type';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(payload: ICreateUser) {
    const existingUser = await this.userRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new BusinessError('User already exists', 409);
    }

    payload.password = HashLib.sync(payload.password, 10);
    return await this.userRepository.create(payload);
  }
}
