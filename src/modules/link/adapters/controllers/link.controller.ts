import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Redirect,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { LinkEntityDocs } from '../docs/link-entity.docs';
import { CreateShortenedLinkDto } from '../dtos/create-shortened-link.dto';
import { UpdateLinkDto } from '../dtos/update-link.dto';
import { CreateShortenedLinkUseCase } from '../../application/use-cases/create-shortened-link.use-case';
import { RedirectToOriginalUrlUseCase } from '../../application/use-cases/redirect-to-original-url.use-case';
import { UserListLinkUseCase } from '../../application/use-cases/user-list-link.use-case';
import { UserDeleteLinkUseCase } from '../../application/use-cases/user-delete-link.use-case';
import { UserUpdateLinkUseCase } from '../../application/use-cases/user-update-link.use-case';
import { OptionalJWTUserAuthGuard } from '../../../auth/adapters/guards/optional-jwt-user-auth.guard';
import { BusinessErrorDocs } from '../../../auth/adapters/docs/business-error.docs';
import { GetUser } from '../../../auth/adapters/decorators/get-user.decorator';
import { IUserEntity } from '../../../auth/application/domain/entities/user.entity.interface';
import { ILinkEntity } from '../../application/domain/entities/link.entity.interface';
import { JWTUserAuthGuard } from '../../../auth/adapters/guards/user-auth.guard';

@ApiTags('Link')
@Controller({ path: 'link' })
export class LinkController {
  constructor(
    private readonly createShortenedLinkUseCase: CreateShortenedLinkUseCase,
    private readonly redirectToOriginalUrlUseCase: RedirectToOriginalUrlUseCase,
    private readonly userListLinkUseCase: UserListLinkUseCase,
    private readonly userDeleteLinkUseCase: UserDeleteLinkUseCase,
    private readonly userUpdateLinkUseCase: UserUpdateLinkUseCase
  ) {}

  @Post('create')
  @UseGuards(OptionalJWTUserAuthGuard)
  @ApiOperation({
    summary: 'Cria um novo link encurtado',
    description:
      'Cria um link anônimo ou, se um token JWT for fornecido, associa o link ao usuário autenticado.'
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateShortenedLinkDto })
  @ApiResponse({
    status: 201,
    description: 'O link foi criado com sucesso.',
    type: LinkEntityDocs
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito ao gerar o código do link.',
    type: BusinessErrorDocs
  })
  async createShortenedLink(
    @Body() body: CreateShortenedLinkDto,
    @GetUser() user?: IUserEntity
  ): Promise<ILinkEntity> {
    const userId = user ? user.id : null;
    return await this.createShortenedLinkUseCase.execute(body.link, userId);
  }

  @Get(':code')
  @Redirect('', HttpStatus.MOVED_PERMANENTLY)
  @ApiOperation({
    summary: 'Redireciona para a URL original e contabiliza o clique',
    description: 'O status de retorno real é um 301 Moved Permanently.'
  })
  @ApiParam({
    name: 'code',
    description: 'O código de 6 caracteres do link.',
    example: 'aZbKq7'
  })
  @ApiResponse({
    status: 301,
    description: 'Redirecionamento para a URL original.'
  })
  @ApiResponse({
    status: 404,
    description: 'O link com o código fornecido não foi encontrado.',
    type: BusinessErrorDocs
  })
  async findLink(@Param('code') code: string) {
    const link = await this.redirectToOriginalUrlUseCase.execute(code);
    return { url: link.original_url };
  }

  @Get('user/list')
  @UseGuards(JWTUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista todos os links do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Uma lista dos links do usuário.',
    type: [LinkEntityDocs]
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async userListLink(@GetUser() user: IUserEntity): Promise<ILinkEntity[]> {
    return await this.userListLinkUseCase.execute(user.id);
  }

  @Delete(':id')
  @UseGuards(JWTUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exclui um link pertencente ao usuário autenticado'
  })
  @ApiParam({
    name: 'id',
    description: 'O ID numérico do link a ser excluído.',
    example: 123
  })
  @ApiResponse({ status: 200, description: 'Link excluído com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'O link não foi encontrado ou não pertence ao usuário.',
    type: BusinessErrorDocs
  })
  async deleteLink(@Param('id') id: number, @GetUser() user: IUserEntity) {
    await this.userDeleteLinkUseCase.execute(id, user.id);
    return { message: 'Link deleted successfully' };
  }

  @Patch(':id')
  @UseGuards(JWTUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza a URL de destino de um link do usuário' })
  @ApiParam({
    name: 'id',
    description: 'O ID numérico do link a ser atualizado.',
    example: 123
  })
  @ApiBody({ type: UpdateLinkDto })
  @ApiResponse({
    status: 200,
    description: 'O link foi atualizado com sucesso.',
    type: LinkEntityDocs
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'O link não foi encontrado ou não pertence ao usuário.',
    type: BusinessErrorDocs
  })
  async updateLink(
    @Body() body: UpdateLinkDto,
    @GetUser() user: IUserEntity
  ): Promise<ILinkEntity> {
    return await this.userUpdateLinkUseCase.execute(body, user.id);
  }
}
