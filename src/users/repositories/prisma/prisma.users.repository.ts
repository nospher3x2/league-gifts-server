import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common';
import { CreateUserDto } from 'src/users/dtos/create.user.dto';
import { UserDomain } from 'src/users/domain/user.domain';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersRepository } from '../users.repository';
import { PrismaUsersMapper } from '../mappers/prisma.users.mapper';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findOneById(id: string): Promise<UserDomain | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return PrismaUsersMapper.toDomain(user);
  }

  public async findOneByEmail(email: string): Promise<UserDomain | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return PrismaUsersMapper.toDomain(user);
  }

  public async countOneByEmail(email: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        email,
      },
      take: 1,
    });
  }

  public async createOne(createUserDto: CreateUserDto): Promise<UserDomain> {
    const user = await this.prisma.user.create({
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

    return PrismaUsersMapper.toDomain(user);
  }
}
