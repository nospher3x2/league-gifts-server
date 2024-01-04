import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local.guard';
import { plainToInstance } from 'class-transformer';
import { CustomResponse } from '@common';
import { UserDomain } from '@common/users';
import { User } from '../../users/decorators/user.decorator';
import { CreateUserDto } from '../../users/dtos/create.user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  public async signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<
    CustomResponse<UserDomain | { accessToken: string; user: UserDomain }>
  > {
    const user = await this.authService.signUp(createUserDto);
    const userMapped = plainToInstance(UserDomain, user);

    return {
      message: this.authService.configService.emailVerificationIsEnabled
        ? `Your account has been created successfully, please check your email to activate your account.`
        : `Your account has been created successfully.`,
      data: this.authService.configService.emailVerificationIsEnabled
        ? userMapped
        : {
            accessToken: await this.authService.createJwtToken(user),
            user: userMapped,
          },
    };
  }

  @Post('signIn')
  @UseGuards(LocalAuthGuard)
  public async signIn(
    @User() user: UserDomain,
  ): Promise<CustomResponse<{ accessToken: string; user: UserDomain }>> {
    const accessToken = await this.authService.createJwtToken(user);
    return {
      message: `Successfully logged in, welcome ${user.name}.`,
      data: {
        accessToken,
        user: plainToInstance(UserDomain, user),
      },
    };
  }
}
