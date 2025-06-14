import { ILinkRepository } from '../repositories/link.repository.interface';

export class UserListLinkUseCase {
  constructor(private readonly linkRepository: ILinkRepository) {}

  async execute(userId: number) {
    return await this.linkRepository.findByUserId(userId);
  }
}
