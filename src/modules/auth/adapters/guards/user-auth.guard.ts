import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IUserEntity } from '../../application/domain/entities/user.entity.interface';

@Injectable()
export class JWTUserAuthGuard extends AuthGuard('user-auth-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: IUserEntity): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException();
    }

    return user as unknown as TUser;
  }
}
