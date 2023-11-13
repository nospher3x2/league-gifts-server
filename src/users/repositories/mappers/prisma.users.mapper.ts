import { User } from '@prisma/client';
import { UserDomain } from 'src/users/domain/user.domain';

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
      balance: user.balance,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
