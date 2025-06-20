import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkController } from './adapters/controllers/link.controller';
import { ILinkRepository } from './application/repositories/link.repository.interface';
import { CreateShortenedLinkUseCase } from './application/use-cases/create-shortened-link.use-case';
import { RedirectToOriginalUrlUseCase } from './application/use-cases/redirect-to-original-url.use-case';
import { UserDeleteLinkUseCase } from './application/use-cases/user-delete-link.use-case';
import { UserListLinkUseCase } from './application/use-cases/user-list-link.use-case';
import { UserUpdateLinkUseCase } from './application/use-cases/user-update-link.use-case';
import { LinkEntityTypeOrm } from './infrastructure/entities/link.typeorm.entity';
import { LinkTypeOrmRepository } from './infrastructure/repositories/link.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LinkEntityTypeOrm])],
  providers: [
    { provide: 'ILinkRepository', useClass: LinkTypeOrmRepository },
    {
      provide: CreateShortenedLinkUseCase,
      useFactory: (linksRepository: ILinkRepository) =>
        new CreateShortenedLinkUseCase(linksRepository),
      inject: ['ILinkRepository']
    },
    {
      provide: RedirectToOriginalUrlUseCase,
      useFactory: (linksRepository: ILinkRepository) =>
        new RedirectToOriginalUrlUseCase(linksRepository),
      inject: ['ILinkRepository']
    },
    {
      provide: UserListLinkUseCase,
      useFactory: (linkRepository: ILinkRepository) =>
        new UserListLinkUseCase(linkRepository),
      inject: ['ILinkRepository']
    },
    {
      provide: UserDeleteLinkUseCase,
      useFactory: (linkRepository: ILinkRepository) =>
        new UserDeleteLinkUseCase(linkRepository),
      inject: ['ILinkRepository']
    },
    {
      provide: UserUpdateLinkUseCase,
      useFactory: (linkRepository: ILinkRepository) =>
        new UserUpdateLinkUseCase(linkRepository),
      inject: ['ILinkRepository']
    }
  ],
  exports: [UserListLinkUseCase, UserDeleteLinkUseCase, UserUpdateLinkUseCase],
  controllers: [LinkController]
})
export class LinkModule {}
