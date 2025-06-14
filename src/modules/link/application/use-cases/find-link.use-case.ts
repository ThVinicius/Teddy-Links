import { BusinessError } from '../errors/business.error';
import { ILinkRepository } from '../repositories/link.repository.interface';

export class FindLinkUseCase {
  constructor(private readonly linkRepository: ILinkRepository) {}

  async execute(shortUrl: string) {
    const link = await this.linkRepository.findOneByShortUrl(shortUrl);

    if (!link) {
      throw new BusinessError('Link not found', 404);
    }

    return link;
  }
}
