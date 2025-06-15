import { ILinkEntity } from '../domain/entities/link.entity.interface';
import { ICreateLink } from '../domain/types/create-link.type';

export interface ILinkRepository {
  createLink: (data: ICreateLink) => Promise<ILinkEntity>;
  findOneByShortUrl: (shortUrl: string) => Promise<ILinkEntity | null>;
  findById: (id: number) => Promise<ILinkEntity | null>;
  findByUserId: (userId: number) => Promise<ILinkEntity[]>;
  softDelete: (id: number) => Promise<void>;
  updateLink: (data: ILinkEntity) => Promise<ILinkEntity>;
}
