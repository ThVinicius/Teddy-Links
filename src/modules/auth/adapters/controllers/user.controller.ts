import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller({
  path: 'user'
})
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post('create')
  async createUser(@Body() body: CreateUserDto) {
    return await this.createUserUseCase.execute(body);
  }
}
