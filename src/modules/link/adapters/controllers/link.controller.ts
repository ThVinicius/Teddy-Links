import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Redirect
} from '@nestjs/common';
import { CreateShortenedLinkUseCase } from '../../application/use-cases/create-shortened-link.use-case';
import { FindLinkUseCase } from '../../application/use-cases/find-link.use-case';
import { CreateShortenedLinkDto } from '../dtos/create-shortened-link.dto';

@Controller({ path: 'link' })
export class LinkController {
  constructor(
    private readonly createShortenedLinkUseCase: CreateShortenedLinkUseCase,
    private readonly findLinkUseCase: FindLinkUseCase
  ) {}

  @Post('create')
  async createShortenedLink(@Body() body: CreateShortenedLinkDto) {
    return await this.createShortenedLinkUseCase.execute(body.link);
  }

  @Get(':shortUrl')
  @Redirect('', HttpStatus.MOVED_PERMANENTLY)
  async findLink(@Param('shortUrl') shortUrl: string) {
    const link = await this.findLinkUseCase.execute(shortUrl);

    return {
      url: link.original_url
    };
  }
}
