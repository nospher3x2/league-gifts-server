import { Controller, Get, UseGuards } from '@nestjs/common';
import { CustomResponse } from '@common/interceptors/response-transform.interceptor';
import { UserDomain } from '../domain/user.domain';
import { UsersService } from '../services/users.service';
import { User } from '../decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { plainToInstance } from 'class-transformer';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('@me')
  public async getCurrentUser(
    @User() user: UserDomain,
  ): Promise<CustomResponse<UserDomain>> {
    return {
      message: `Welcome ${user.name}`,
      data: plainToInstance(UserDomain, user),
    };
  }
}
