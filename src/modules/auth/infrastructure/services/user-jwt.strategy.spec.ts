import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IUserEntity } from '../../application/domain/entities/user.entity.interface';
import { UserJwtStrategy } from './auth-strategy.service';

const mockUserRepository = {
  findByEmail: jest.fn()
};

describe('UserJwtStrategy', () => {
  let strategy: UserJwtStrategy;

  beforeEach(async () => {
    process.env.USER_AUTH_JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserJwtStrategy,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository
        }
      ]
    }).compile();

    strategy = module.get<UserJwtStrategy>(UserJwtStrategy);

    jest.clearAllMocks();
  });

  it('deve retornar o usuário se ele for encontrado no repositório', async () => {
    const payload = { id: 1, email: 'test@example.com' };
    const mockUser: IUserEntity = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_password',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await strategy.validate(payload);

    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(payload.email);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
  });

  it('deve lançar um NotFoundException se o usuário não for encontrado', async () => {
    const payload = { id: 2, email: 'notfound@example.com' };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(NotFoundException);
    await expect(strategy.validate(payload)).rejects.toThrow('User not found');

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(payload.email);
  });

  it('deve ser definido', () => {
    expect(strategy).toBeDefined();
  });
});
