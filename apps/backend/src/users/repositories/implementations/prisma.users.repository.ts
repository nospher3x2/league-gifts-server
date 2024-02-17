import { BadRequestException, Injectable } from '@nestjs/common';
import { FlatTransactionClient, PrismaService } from '@common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { UsersRepository } from '../users.repository';
import { PrismaUsersMapper } from '../mappers/prisma.users.mapper';
import { randomUUID } from 'crypto';
import { CreateUserDto } from '../../dtos/create.user.dto';
import { UserDomain } from '@common/users';

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

  public async createTransactionToDecrementBalanceByIdAndCurrentBalance(
    id: string,
    balance: number,
    currentBalance: number,
  ): Promise<{
    transaction: FlatTransactionClient;
    user: UserDomain;
  }> {
    const transaction = await this.prisma.transactionClient.$begin(
      Prisma.TransactionIsolationLevel.Serializable,
    );

    try {
      const lockResult: UserDomain[] = await transaction.$queryRaw`
            SELECT * FROM User WHERE id = ${id} AND balance = ${currentBalance} LIMIT 1 FOR UPDATE;
          `;

      if (lockResult.length === 0) {
        throw new BadRequestException(
          'Failed to find your current balance to decrement, please try again. If the problem persists, contact support.',
        );
      }

      const user = await transaction.user
        .update({
          data: {
            balance: {
              decrement: balance,
            },
          },
          where: {
            id,
            balance: currentBalance,
          },
        })
        .catch((error: Prisma.PrismaClientKnownRequestError) => {
          if (error.code === 'P2025') {
            throw new BadRequestException(
              'Failed to decrement balance, please try again. If the problem persists, contact support.',
            );
          }

          throw error;
        });

      if (!user) {
        throw new BadRequestException(
          'Failed to decrement balance, please try again. If the problem persists, contact support.',
        );
      }

      if (user.balance.lessThan(0)) {
        throw new BadRequestException(
          `You dont have enough balance. Your current balance is ${user.balance.toString()}.`,
        );
      }

      return {
        transaction,
        user: PrismaUsersMapper.toDomain(user),
      };
    } catch (error) {
      await transaction.$rollback();
      throw error;
    }
  }
}
