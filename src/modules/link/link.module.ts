import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkController } from './adapters/controllers/link.controller';
import { ILinkRepository } from './application/repositories/link.repository.interface';
import { CreateShortenedLinkUseCase } from './application/use-cases/create-shortened-link.use-case';
import { FindLinkUseCase } from './application/use-cases/find-link.use-case';
import { UserListLinkUseCase } from './application/use-cases/user-list-link.use-case';
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
      provide: FindLinkUseCase,
      useFactory: (linksRepository: ILinkRepository) =>
        new FindLinkUseCase(linksRepository),
      inject: ['ILinkRepository']
    },
    {
      provide: UserListLinkUseCase,
      useFactory: (linkRepository: ILinkRepository) =>
        new UserListLinkUseCase(linkRepository),
      inject: ['ILinkRepository']
    }
  ],
  exports: [UserListLinkUseCase],
  controllers: [LinkController]
})
export class LinkModule {}
