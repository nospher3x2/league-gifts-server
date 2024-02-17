import { UserDomain } from '@common/users';
import { CreateUserDto } from '../dtos/create.user.dto';
import { FlatTransactionClient } from '@common';

export abstract class UsersRepository {
  public abstract findOneById(id: string): Promise<UserDomain | null>;
  public abstract findOneByEmail(email: string): Promise<UserDomain | null>;
  public abstract countOneByEmail(email: string): Promise<number>;
  public abstract createOne(createUserDto: CreateUserDto): Promise<UserDomain>;
  public abstract createTransactionToDecrementBalanceByIdAndCurrentBalance(
    id: string,
    balance: number,
    currentBalance: number,
  ): Promise<{
    transaction: FlatTransactionClient;
    user: UserDomain;
  }>;
}
