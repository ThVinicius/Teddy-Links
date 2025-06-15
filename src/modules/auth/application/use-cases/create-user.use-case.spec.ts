import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../repositories/user.repository.interface';
import { HashLib } from '../../infrastructure/libs/hash.lib';
import { BusinessError } from '../../../link/application/errors/business.error';
import { ICreateUser } from '../types/create-user.type';
import { IUserEntity } from '../domain/entities/user.entity.interface';

jest.mock('../../infrastructure/libs/hash.lib');

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn()
    };

    createUserUseCase = new CreateUserUseCase(mockUserRepository);

    jest.clearAllMocks();
  });

  it('deve criar um novo usuário com sucesso se o e-mail não existir', async () => {
    const payload: ICreateUser = {
      name: 'João da Silva',
      email: 'joao@example.com',
      password: 'password123'
    };

    const hashedPassword = 'hashed_password';
    const expectedUser: IUserEntity = {
      id: 1,
      ...payload,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    (HashLib.sync as jest.Mock).mockReturnValue(hashedPassword);
    mockUserRepository.create.mockResolvedValue(expectedUser);

    const result = await createUserUseCase.execute(payload);

    expect(result).toEqual(expectedUser);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(payload.email);

    expect(HashLib.sync).toHaveBeenCalledWith('password123', 10);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      ...payload,
      password: hashedPassword
    });
  });

  it('deve lançar um BusinessError se o e-mail já existir', async () => {
    const payload: ICreateUser = {
      name: 'João da Silva',
      email: 'joao@example.com',
      password: 'password123'
    };

    const existingUser: IUserEntity = {
      id: 1,
      name: 'João Existente',
      email: 'joao@example.com',
      password: 'hashed_password_existente',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(createUserUseCase.execute(payload)).rejects.toThrow(
      new BusinessError('User already exists', 409)
    );

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(payload.email);
    expect(HashLib.sync).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
