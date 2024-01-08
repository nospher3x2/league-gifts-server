import { UserDomain } from '@common/users';
import { User } from '@prisma/client';

export class PrismaUsersMapper {
  public static toDomain(user: User): UserDomain {
    if (!user) {
      return null;
    }

    return new UserDomain({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      balance: user.balance.toNumber(),
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
