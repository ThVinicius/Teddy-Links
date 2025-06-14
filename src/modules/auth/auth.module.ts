import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './adapters/controllers/user.controller';
import { UserEntityTypeOrm } from './infrastructure/entities/user.typeorm.entity';
import { UserTypeOrmRepository } from './infrastructure/repositories/user.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntityTypeOrm])],
  providers: [{ provide: 'IUserRepository', useClass: UserTypeOrmRepository }],
  exports: [],
  controllers: [UserController]
})
export class AuthModule {}
