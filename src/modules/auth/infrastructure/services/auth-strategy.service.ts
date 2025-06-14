import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository } from '../../application/repositories/user.repository.interface';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(
  Strategy,
  'user-auth-jwt'
) {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.USER_AUTH_JWT_SECRET!
    });
  }

  async validate(payload: { id: number; email: string }) {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
