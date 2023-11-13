import { Exclude } from 'class-transformer';
import { UserStatus } from '../enums/user.status.enum';
import { UserRole } from '../enums/user.role.enum';
import Decimal from 'decimal.js';

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

  public hasSufficientBalance(amount: number): boolean {
    return Decimal.sub(this.balance, amount).gte(0);
  }
}
