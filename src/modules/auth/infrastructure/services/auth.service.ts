import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthService } from '../../application/services/auth.interface';
import { IUserRepository } from '../../application/repositories/user.repository.interface';
import { HashLib } from '../libs/hash.lib';
import { IUserEntity } from '../../application/domain/entities/user.entity.interface';
import { Credentials } from '../../application/types/credentials.type';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async verifyCredentials(
    email: string,
    password: string
  ): Promise<Credentials> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User or Password Invalid');
    }

    if (HashLib.compareSync(password, user.password)) {
      return this.createAccessToken(user);
    }

    throw new UnauthorizedException('User or Password Invalid');
  }

  private createAccessToken(payload: IUserEntity): Credentials {
    const TOKEN_EXPIRATION_IN_SECONDS = 3600;

    return {
      access_token: this.jwtService.sign(
        { id: payload.id, email: payload.email },
        {
          expiresIn: 3600
        }
      ),
      token_type: 'Bearer',
      expires_in: TOKEN_EXPIRATION_IN_SECONDS
    };
  }
}
