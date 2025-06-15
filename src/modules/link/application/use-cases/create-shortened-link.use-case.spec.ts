import { CreateShortenedLinkUseCase } from './create-shortened-link.use-case';
import { ILinkRepository } from '../repositories/link.repository.interface';
import { IdGeneratorLib } from '../../infrastructure/libs/id-generator.lib';
import { BusinessError } from '../errors/business.error';
import { ILinkEntity } from '../domain/entities/link.entity.interface';

jest.mock('../../infrastructure/libs/id-generator.lib');

describe('CreateShortenedLinkUseCase', () => {
  let useCase: CreateShortenedLinkUseCase;
  let mockLinksRepository: jest.Mocked<ILinkRepository>;

  const mockLinkEntity: ILinkEntity = {
    id: 1,
    short_code: 'SUCCESS',
    original_url: 'http://test.com',
    click_count: 0,
    user_id: null,
    created_at: new Date(),
    updated_at: new Date()
  };

  beforeEach(() => {
    mockLinksRepository = {
      createLink: jest.fn()
    } as unknown as jest.Mocked<ILinkRepository>;
    useCase = new CreateShortenedLinkUseCase(mockLinksRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um link com sucesso na primeira tentativa', async () => {
    (IdGeneratorLib.generateId as jest.Mock).mockReturnValue('SUCCESS');
    mockLinksRepository.createLink.mockResolvedValue(mockLinkEntity);

    const result = await useCase.execute('http://test.com', null);

    expect(result).toEqual(mockLinkEntity);
    expect(IdGeneratorLib.generateId).toHaveBeenCalledTimes(1);
    expect(mockLinksRepository.createLink).toHaveBeenCalledTimes(1);
    expect(mockLinksRepository.createLink).toHaveBeenCalledWith({
      original_url: 'http://test.com',
      short_code: 'SUCCESS',
      user_id: null
    });
  });

  it('deve tentar novamente e criar um link com sucesso após uma colisão', async () => {
    (IdGeneratorLib.generateId as jest.Mock)
      .mockReturnValueOnce('COLLISION')
      .mockReturnValueOnce('SUCCESS');

    const uniqueConstraintError = { code: '23505' };
    mockLinksRepository.createLink
      .mockRejectedValueOnce(uniqueConstraintError)
      .mockResolvedValueOnce(mockLinkEntity);

    const result = await useCase.execute('http://test.com', null);

    expect(result).toEqual(mockLinkEntity);
    expect(IdGeneratorLib.generateId).toHaveBeenCalledTimes(2);
    expect(mockLinksRepository.createLink).toHaveBeenCalledTimes(2);
    expect(mockLinksRepository.createLink).toHaveBeenCalledWith({
      original_url: 'http://test.com',
      short_code: 'COLLISION',
      user_id: null
    });
    expect(mockLinksRepository.createLink).toHaveBeenCalledWith({
      original_url: 'http://test.com',
      short_code: 'SUCCESS',
      user_id: null
    });
  });

  it('deve lançar um BusinessError após exceder o número máximo de tentativas', async () => {
    (IdGeneratorLib.generateId as jest.Mock).mockReturnValue('ANY_CODE');
    const uniqueConstraintError = { code: '23505' };
    mockLinksRepository.createLink.mockRejectedValue(uniqueConstraintError);

    await expect(useCase.execute('http://test.com', null)).rejects.toThrow(
      BusinessError
    );

    expect(mockLinksRepository.createLink).toHaveBeenCalledTimes(5);
  });

  it('deve relançar o erro se não for uma violação de unicidade', async () => {
    const unexpectedError = new Error('Database connection error');
    mockLinksRepository.createLink.mockRejectedValue(unexpectedError);

    await expect(useCase.execute('http://test.com', null)).rejects.toThrow(
      'Database connection error'
    );

    expect(mockLinksRepository.createLink).toHaveBeenCalledTimes(1);
  });
});
