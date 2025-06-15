import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../dtos/create-user.dto';
import { BusinessErrorDocs } from '../docs/business-error.docs';
import { UserEntityDocs } from '../docs/user-entity.docs';

@ApiTags('User')
@Controller({
  path: 'user'
})
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @ApiOperation({
    summary: 'Cria usuário'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    type: BusinessErrorDocs,
    description: 'Esse erro é lançado quando não se encontra o usuário'
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserEntityDocs })
  @Post('create')
  async createUser(@Body() body: CreateUserDto) {
    return await this.createUserUseCase.execute(body);
  }
}
