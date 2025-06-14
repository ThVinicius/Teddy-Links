import { BusinessError } from '../errors/business.error';
import { ILinkRepository } from '../repositories/link.repository.interface';

export class UserDeleteLinkUseCase {
  constructor(private readonly linkRepository: ILinkRepository) {}

  async execute(linkId: number, userId: number): Promise<void> {
    const link = await this.linkRepository.findById(linkId);

    if (!link || link?.user_id !== userId) {
      throw new BusinessError(
        'Link not found or you do not have permission to delete it.',
        404
      );
    }

    return await this.linkRepository.softDelete(linkId);
  }
}
