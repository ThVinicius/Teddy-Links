import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILinkRepository } from '../../application/repositories/link.repository.interface';
import { LinkEntityTypeOrm } from '../entities/link.typeorm.entity';
import { ILinkEntity } from '../../application/domain/entities/link.entity.interface';
import { ICreateLink } from '../../application/domain/types/create-link.type';

export class LinkTypeOrmRepository implements ILinkRepository {
  constructor(
    @InjectRepository(LinkEntityTypeOrm)
    readonly repository: Repository<LinkEntityTypeOrm>
  ) {}

  async createLink(data: ICreateLink): Promise<ILinkEntity> {
    const linkEntity = this.repository.create(data);

    return await this.repository.save(linkEntity);
  }

  async findOneByShortUrl(shortUrl: string): Promise<ILinkEntity | null> {
    return await this.repository.findOne({
      where: { short_url: shortUrl }
    });
  }
}
