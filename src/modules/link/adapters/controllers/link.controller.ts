import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Redirect,
  UseGuards
} from '@nestjs/common';
import { CreateShortenedLinkUseCase } from '../../application/use-cases/create-shortened-link.use-case';
import { FindLinkUseCase } from '../../application/use-cases/find-link.use-case';
import { CreateShortenedLinkDto } from '../dtos/create-shortened-link.dto';
import { JWTUserAuthGuard } from '../../../auth/adapters/guards/user-auth.guard';
import { GetUser } from '../../../auth/adapters/decorators/get-user.decorator';
import { IUserEntity } from '../../../auth/application/domain/entities/user.entity.interface';
import { UserListLinkUseCase } from '../../application/use-cases/user-list-link.use-case';
import { UserDeleteLinkUseCase } from '../../application/use-cases/user-delete-link.use-case';

@Controller({ path: 'link' })
export class LinkController {
  constructor(
    private readonly createShortenedLinkUseCase: CreateShortenedLinkUseCase,
    private readonly findLinkUseCase: FindLinkUseCase,
    private readonly userListLinkUseCase: UserListLinkUseCase,
    private readonly userDeleteLinkUseCase: UserDeleteLinkUseCase
  ) {}

  @UseGuards(JWTUserAuthGuard)
  @Post('create')
  async createShortenedLink(
    @Body() body: CreateShortenedLinkDto,
    @GetUser() user: IUserEntity
  ) {
    return await this.createShortenedLinkUseCase.execute(body.link, user.id);
  }

  @Get(':shortUrl')
  @Redirect('', HttpStatus.MOVED_PERMANENTLY)
  async findLink(@Param('shortUrl') shortUrl: string) {
    const link = await this.findLinkUseCase.execute(shortUrl);

    return {
      url: link.original_url
    };
  }

  @UseGuards(JWTUserAuthGuard)
  @Get('user/list')
  async userListLink(@GetUser() user: IUserEntity) {
    return await this.userListLinkUseCase.execute(user.id);
  }

  @UseGuards(JWTUserAuthGuard)
  @Delete(':id')
  async deleteLink(@Param('id') id: number, @GetUser() user: IUserEntity) {
    await this.userDeleteLinkUseCase.execute(id, user.id);
    return { message: 'Link deleted successfully' };
  }
}
