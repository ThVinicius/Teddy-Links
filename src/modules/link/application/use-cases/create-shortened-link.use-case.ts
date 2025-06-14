import { IdGeneratorLib } from '../../infrastructure/libs/id-generator.lib';
import { ILinkRepository } from '../repositories/link.repository.interface';
import { SHORT_URL_SIZE } from '../../constants/link.constant';
import { ILinkEntity } from '../domain/entities/link.entity.interface';
import { BusinessError } from '../errors/business.error';

export class CreateShortenedLinkUseCase {
  private readonly MAX_RETRIES = 5;

  constructor(private readonly linksRepository: ILinkRepository) {}

  async execute(
    original_url: string,
    user_id: number | null
  ): Promise<ILinkEntity> {
    return await this.createUniqueLink(original_url, user_id, this.MAX_RETRIES);
  }

  private async createUniqueLink(
    original_url: string,
    user_id: number | null,
    retries: number
  ): Promise<ILinkEntity> {
    if (retries === 0) {
      throw new BusinessError('', 500);
    }

    const shortId = IdGeneratorLib.generateId(SHORT_URL_SIZE);

    try {
      const newLink = await this.linksRepository.createLink({
        original_url,
        short_code: shortId,
        user_id
      });

      return newLink;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === '23505'
      ) {
        return await this.createUniqueLink(original_url, user_id, retries - 1);
      }

      throw error;
    }
  }
}
