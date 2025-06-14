import { ILinkEntity } from '../domain/entities/link.entity.interface';
import { ICreateLink } from '../domain/types/create-link.type';

export interface ILinkRepository {
  createLink(data: ICreateLink): Promise<ILinkEntity>;
  findLinkByShortUrl(shortUrl: string): Promise<ILinkEntity | null>;
}
