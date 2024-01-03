import { PasswordService } from '@common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfigService } from '../config/auth.config.service';
import { UserDomain } from '../../users/domain/user.domain';
import { CreateUserDto } from '../../users/dtos/create.user.dto';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    public readonly configService: AuthConfigService,
    private readonly userService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  public async findOneUserByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserDomain | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    delete user.password;
    return user;
  }

  public async signUp(createUserDto: CreateUserDto): Promise<UserDomain> {
    return this.userService.createOne(createUserDto);
  }

  public checkIfUserIsActive(user: UserDomain): void {
    switch (user.status) {
      case 'ACTIVE':
        return;
      case 'PENDING':
        if (!this.configService.emailVerificationIsEnabled) {
          return;
        }

        throw new ForbiddenException(
          'You need to activate your account before you can login',
        );
      case 'BANNED':
        throw new ForbiddenException(
          'Your account has been banned, please contact the administrator',
        );
      case 'DELETED':
        throw new ForbiddenException(
          'Your account has been deleted, please contact the administrator',
        );
      default:
        throw new ForbiddenException(
          'Your account is not active, please contact the administrator',
        );
    }
  }

  public async createJwtToken(user: UserDomain): Promise<string> {
    this.checkIfUserIsActive(user);

    return this.jwtService.signAsync({
      email: user.email,
      sub: user.id,
    });
  }
}
