import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { UsersRepository } from '../users.repository';
import { PrismaUsersMapper } from '../mappers/prisma.users.mapper';
import { randomUUID } from 'crypto';
import { UserDomain } from '../../domain/user.domain';
import { CreateUserDto } from '../../dtos/create.user.dto';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findOneById(id: string): Promise<UserDomain | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return PrismaUsersMapper.toDomain(user);
  }

  public async findOneByEmail(email: string): Promise<UserDomain | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return PrismaUsersMapper.toDomain(user);
  }

  public countOneByEmail(email: string): Promise<number> {
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

  public async decrementOneBalanceByIdAndCurrentBalance(
    id: string,
    balance: number,
    currentBalance: number,
  ): Promise<UserDomain> {
    return await this.prisma.$transaction(
      async (transaction) => {
        const lockResult: UserDomain[] = await transaction.$queryRaw`
          SELECT * FROM User WHERE id = ${id} AND balance = ${currentBalance} LIMIT 1 FOR UPDATE;
        `;

        if (lockResult.length === 0) {
          throw new BadRequestException(
            'Invalid current balance, please try again',
          );
        }

        const user = await transaction.user.update({
          data: {
            balance: {
              decrement: balance,
            },
          },
          where: {
            id,
            balance: currentBalance,
          },
        });

        if (!user) {
          throw new BadRequestException(
            'Failed to decrement balance, please try again',
          );
        }

        if (user.balance < 0) {
          throw new BadRequestException(
            `${user.name} does not have enough balance`,
          );
        }

        return PrismaUsersMapper.toDomain(user);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
