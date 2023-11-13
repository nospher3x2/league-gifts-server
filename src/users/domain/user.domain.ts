import { Exclude } from 'class-transformer';
import { UserStatus } from '../enums/user.status.enum';
import { UserRole } from '../enums/user.role.enum';

export class UserDomain {
  public id: string;
  public email: string;
  public name: string;
  @Exclude()
  public password: string;
  public balance: number;
  public role: keyof typeof UserRole;
  public status: keyof typeof UserStatus;
  @Exclude()
  public createdAt: Date;
  @Exclude()
  public updatedAt: Date;

  constructor(partial: Partial<UserDomain>) {
    Object.assign(this, partial);
  }
}
