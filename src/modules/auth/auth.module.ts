import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './adapters/controllers/auth.controller';
import { UserController } from './adapters/controllers/user.controller';
import { IUserRepository } from './application/repositories/user.repository.interface';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserEntityTypeOrm } from './infrastructure/entities/user.typeorm.entity';
import { UserTypeOrmRepository } from './infrastructure/repositories/user.typeorm.repository';
import { AuthService } from './infrastructure/services/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntityTypeOrm]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('USER_AUTH_JWT_SECRET')
      }),
      inject: [ConfigService]
    })
  ],
  providers: [
    { provide: 'IUserRepository', useClass: UserTypeOrmRepository },
    {
      provide: CreateUserUseCase,
      useFactory: (userRepository: IUserRepository) =>
        new CreateUserUseCase(userRepository),
      inject: ['IUserRepository']
    },
    { provide: 'IAuthService', useClass: AuthService }
  ],
  exports: [],
  controllers: [UserController, AuthController]
})
export class AuthModule {}
