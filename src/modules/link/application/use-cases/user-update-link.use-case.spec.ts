import { UserUpdateLinkUseCase } from './user-update-link.use-case';
import { ILinkRepository } from '../repositories/link.repository.interface';
import { BusinessError } from '../errors/business.error';
import { UpdateLink } from '../domain/types/update-link.type';
import { ILinkEntity } from '../domain/entities/link.entity.interface';

const mockLinkRepository = {
  findById: jest.fn(),
  updateLink: jest.fn()
};

describe('UserUpdateLinkUseCase', () => {
  let useCase: UserUpdateLinkUseCase;

  beforeEach(() => {
    useCase = new UserUpdateLinkUseCase(
      mockLinkRepository as unknown as ILinkRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve atualizar a URL de um link se ele existir e pertencer ao usuário', async () => {
    const userId = 10;
    const payload: UpdateLink = {
      id: 1,
      original_url: 'https://new-url.com'
    };
    const existingLink: ILinkEntity = {
      id: 1,
      user_id: userId,
      original_url: 'https://old-url.com',
      short_code: 'abc',
      click_count: 5,
      created_at: new Date(),
      updated_at: new Date()
    };
    const updatedLink: ILinkEntity = {
      ...existingLink,
      original_url: payload.original_url,
      updated_at: new Date()
    };

    mockLinkRepository.findById.mockResolvedValue(existingLink);
    mockLinkRepository.updateLink.mockResolvedValue(updatedLink);

    const result = await useCase.execute(payload, userId);

    expect(result).toEqual(updatedLink);
    expect(mockLinkRepository.findById).toHaveBeenCalledWith(payload.id);
    expect(mockLinkRepository.updateLink).toHaveBeenCalledTimes(1);

    expect(mockLinkRepository.updateLink).toHaveBeenCalledWith(
      expect.objectContaining({ original_url: 'https://new-url.com' })
    );
  });

  it('deve lançar um BusinessError se o link a ser atualizado não for encontrado', async () => {
    const userId = 10;
    const payload: UpdateLink = { id: 999, original_url: 'https://any.com' };

    mockLinkRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(payload, userId)).rejects.toThrow(
      BusinessError
    );
    await expect(useCase.execute(payload, userId)).rejects.toThrow(
      'Link not found or you do not have permission to update it'
    );
    expect(mockLinkRepository.updateLink).not.toHaveBeenCalled();
  });

  it('deve lançar um BusinessError se o link pertencer a outro usuário', async () => {
    const userId = 10;
    const anotherUserId = 99;
    const payload: UpdateLink = { id: 1, original_url: 'https://any.com' };
    const existingLink: ILinkEntity = {
      id: 1,
      user_id: anotherUserId,
      original_url: 'https://old-url.com',
      short_code: 'abc',
      click_count: 5,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockLinkRepository.findById.mockResolvedValue(existingLink);

    await expect(useCase.execute(payload, userId)).rejects.toThrow(
      BusinessError
    );
    expect(mockLinkRepository.updateLink).not.toHaveBeenCalled();
  });
});
