import { UpdateLink } from '../domain/types/update-link.type';
import { BusinessError } from '../errors/business.error';
import { ILinkRepository } from '../repositories/link.repository.interface';

export class UserUpdateLinkUseCase {
  constructor(private readonly linkRepository: ILinkRepository) {}

  async execute(payload: UpdateLink, userId: number) {
    const existingLink = await this.linkRepository.findById(payload.id);

    if (!existingLink || existingLink.user_id !== userId) {
      throw new BusinessError(
        'Link not found or you do not have permission to update it',
        404
      );
    }

    existingLink.original_url = payload.original_url;
    return await this.linkRepository.updateLink(existingLink);
  }
}
