import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post
} from '@nestjs/common';
import { LoginUserDto } from '../dtos/login-user.dto';
import { IAuthService } from '../../application/services/auth.interface';

@Controller({
  path: 'auth'
})
export class AuthController {
  constructor(
    @Inject('IAuthService') private readonly authService: IAuthService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('user/login')
  async login(@Body() body: LoginUserDto) {
    return await this.authService.verifyCredentials(body.email, body.password);
  }
}
