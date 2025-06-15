import { UserDeleteLinkUseCase } from './user-delete-link.use-case';
import { ILinkRepository } from '../repositories/link.repository.interface';
import { BusinessError } from '../errors/business.error';
import { ILinkEntity } from '../domain/entities/link.entity.interface';

const mockLinkRepository = {
  findById: jest.fn(),
  softDelete: jest.fn()
};

describe('UserDeleteLinkUseCase', () => {
  let useCase: UserDeleteLinkUseCase;

  beforeEach(() => {
    useCase = new UserDeleteLinkUseCase(
      mockLinkRepository as unknown as ILinkRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve deletar o link com sucesso se ele existir e pertencer ao usuário', async () => {
    const linkId = 1;
    const userId = 10;
    const mockLink: ILinkEntity = {
      id: linkId,
      user_id: userId,
      short_code: 'abc',
      original_url: 'http://test.com',
      click_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockLinkRepository.findById.mockResolvedValue(mockLink);
    mockLinkRepository.softDelete.mockResolvedValue(undefined);

    await useCase.execute(linkId, userId);

    expect(mockLinkRepository.findById).toHaveBeenCalledWith(linkId);
    expect(mockLinkRepository.softDelete).toHaveBeenCalledWith(linkId);
    expect(mockLinkRepository.softDelete).toHaveBeenCalledTimes(1);
  });

  it('deve lançar um BusinessError se o link não for encontrado', async () => {
    const linkId = 999;
    const userId = 10;

    mockLinkRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(linkId, userId)).rejects.toThrow(
      BusinessError
    );
    await expect(useCase.execute(linkId, userId)).rejects.toThrow(
      'Link not found or you do not have permission to delete it.'
    );

    expect(mockLinkRepository.softDelete).not.toHaveBeenCalled();
  });

  it('deve lançar um BusinessError se o link pertencer a outro usuário', async () => {
    const linkId = 1;
    const userId = 10;
    const anotherUserId = 99;
    const mockLink: ILinkEntity = {
      id: linkId,
      user_id: anotherUserId,
      short_code: 'abc',
      original_url: 'http://test.com',
      click_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockLinkRepository.findById.mockResolvedValue(mockLink);

    await expect(useCase.execute(linkId, userId)).rejects.toThrow(
      BusinessError
    );
    await expect(useCase.execute(linkId, userId)).rejects.toThrow(
      'Link not found or you do not have permission to delete it.'
    );

    expect(mockLinkRepository.softDelete).not.toHaveBeenCalled();
  });
});
