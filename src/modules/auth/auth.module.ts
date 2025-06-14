import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './adapters/controllers/user.controller';
import { IUserRepository } from './application/repositories/user.repository.interface';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserEntityTypeOrm } from './infrastructure/entities/user.typeorm.entity';
import { UserTypeOrmRepository } from './infrastructure/repositories/user.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntityTypeOrm])],
  providers: [
    { provide: 'IUserRepository', useClass: UserTypeOrmRepository },
    {
      provide: CreateUserUseCase,
      useFactory: (userRepository: IUserRepository) =>
        new CreateUserUseCase(userRepository),
      inject: ['IUserRepository']
    }
  ],
  exports: [],
  controllers: [UserController]
})
export class AuthModule {}
