import { UserDomain } from '../domain/user.domain';
import { CreateUserDto } from '../dtos/create.user.dto';

export abstract class UsersRepository {
  public abstract findOneById(id: string): Promise<UserDomain | null>;
  public abstract findOneByEmail(email: string): Promise<UserDomain | null>;
  public abstract countOneByEmail(email: string): Promise<number>;
  public abstract createOne(createUserDto: CreateUserDto): Promise<UserDomain>;
}
