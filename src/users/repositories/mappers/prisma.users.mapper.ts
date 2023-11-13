import { User } from '@prisma/client';
import { UserDomain } from 'src/users/domain/user.domain';

export class PrismaUsersMapper {
  public static toDomain(raw: User): UserDomain {
    return new UserDomain({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      balance: raw.balance,
      role: raw.role,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
