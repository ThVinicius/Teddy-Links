import { RedirectToOriginalUrlUseCase } from './redirect-to-original-url.use-case';
import { ILinkRepository } from '../repositories/link.repository.interface';
import { BusinessError } from '../errors/business.error';
import { ILinkEntity } from '../domain/entities/link.entity.interface';

const mockLinkRepository = {
  findOneByShortUrl: jest.fn(),
  updateLink: jest.fn()
};

describe('RedirectToOriginalUrlUseCase', () => {
  let useCase: RedirectToOriginalUrlUseCase;

  beforeEach(() => {
    useCase = new RedirectToOriginalUrlUseCase(
      mockLinkRepository as unknown as ILinkRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve encontrar o link, incrementar o contador de cliques e retorná-lo', async () => {
    const shortCode = 'aZbKq7';
    const initialClickCount = 10;
    const mockLink: ILinkEntity = {
      id: 1,
      short_code: shortCode,
      original_url: 'https://test.com',
      click_count: initialClickCount,
      user_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockLinkRepository.findOneByShortUrl.mockResolvedValue(mockLink);

    mockLinkRepository.updateLink.mockResolvedValue(undefined);

    const result = await useCase.execute(shortCode);

    expect(result.click_count).toBe(initialClickCount + 1);
    expect(result.original_url).toBe(mockLink.original_url);

    expect(mockLinkRepository.findOneByShortUrl).toHaveBeenCalledWith(
      shortCode
    );
    expect(mockLinkRepository.findOneByShortUrl).toHaveBeenCalledTimes(1);

    expect(mockLinkRepository.updateLink).toHaveBeenCalledTimes(1);
    expect(mockLinkRepository.updateLink).toHaveBeenCalledWith(
      expect.objectContaining({
        click_count: initialClickCount + 1
      })
    );
  });

  it('deve lançar um BusinessError se o link não for encontrado', async () => {
    const shortCode = 'notfound';

    mockLinkRepository.findOneByShortUrl.mockResolvedValue(null);

    await expect(useCase.execute(shortCode)).rejects.toThrow(BusinessError);
    await expect(useCase.execute(shortCode)).rejects.toThrow(
      new BusinessError('Link not found', 404)
    );

    expect(mockLinkRepository.updateLink).not.toHaveBeenCalled();
  });
});
