import { UserListLinkUseCase } from './user-list-link.use-case';
import { ILinkRepository } from '../repositories/link.repository.interface';
import { ILinkEntity } from '../domain/entities/link.entity.interface';

const mockLinkRepository = {
  findByUserId: jest.fn()
};

describe('UserListLinkUseCase', () => {
  let useCase: UserListLinkUseCase;

  beforeEach(() => {
    useCase = new UserListLinkUseCase(
      mockLinkRepository as unknown as ILinkRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar uma lista de links para um ID de usuário específico', async () => {
    const userId = 1;
    const mockLinks: ILinkEntity[] = [
      {
        id: 1,
        user_id: userId,
        short_code: 'abc',
        original_url: 'http://test1.com',
        click_count: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        user_id: userId,
        short_code: 'def',
        original_url: 'http://test2.com',
        click_count: 10,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockLinkRepository.findByUserId.mockResolvedValue(mockLinks);

    const result = await useCase.execute(userId);

    expect(result).toEqual(mockLinks);
    expect(result).toHaveLength(2);
    expect(mockLinkRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(mockLinkRepository.findByUserId).toHaveBeenCalledTimes(1);
  });

  it('deve retornar um array vazio se o usuário não tiver links', async () => {
    const userId = 2;

    mockLinkRepository.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute(userId);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(mockLinkRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(mockLinkRepository.findByUserId).toHaveBeenCalledTimes(1);
  });
});
