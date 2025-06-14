import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IUserEntity } from '../../application/domain/entities/user.entity.interface';

@Injectable()
export class OptionalJWTUserAuthGuard extends AuthGuard('user-auth-jwt') {
  handleRequest<TUser = any>(err: any, user: IUserEntity): TUser {
    return user as unknown as TUser;
  }
}
