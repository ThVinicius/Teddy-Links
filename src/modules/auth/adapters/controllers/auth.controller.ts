import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from '../dtos/login-user.dto';
import { IAuthService } from '../../application/services/auth.interface';
import { CredentialsDocs } from '../docs/credentials.doc';
import { BusinessErrorDocs } from '../docs/business-error.docs';

@ApiTags('Auth')
@Controller({
  path: 'auth'
})
export class AuthController {
  constructor(
    @Inject('IAuthService') private readonly authService: IAuthService
  ) {}

  @ApiOperation({
    summary: 'Realiza o login do usuário'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BusinessErrorDocs,
    description: 'Esse erro é lançado quando não se encontra o usuário'
  })
  @ApiResponse({ status: HttpStatus.OK, type: CredentialsDocs })
  @HttpCode(HttpStatus.OK)
  @Post('user/login')
  async login(@Body() body: LoginUserDto) {
    return await this.authService.verifyCredentials(body.email, body.password);
  }
}
