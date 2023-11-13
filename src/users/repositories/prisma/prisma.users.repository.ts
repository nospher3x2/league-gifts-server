import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common';
import { CreateUserDto } from 'src/users/dtos/create.user.dto';
import { UserDomain } from 'src/users/domain/user.domain';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersRepository } from '../users.repository';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  public findOneById(id: string): Promise<UserDomain | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  public findOneByEmail(email: string): Promise<UserDomain | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  public countOneByEmail(email: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        email,
      },
      take: 1,
    });
  }

  public createOne(createUserDto: CreateUserDto): Promise<UserDomain> {
    return this.prisma.user.create({
      data: {
        id: randomUUID(),
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        balance: 0,
        role: UserRole.USER,
        status: UserStatus.PENDING,
      },
    });
  }
}
