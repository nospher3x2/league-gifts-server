import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { UserDomain } from '@common/users';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  public async validate(email: string, password: string): Promise<UserDomain> {
    const user = await this.authService.findOneUserByEmailAndPassword(
      email,
      password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
