import { UserRole, UserStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';
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

  public hasSufficientBalance(amount: Decimal | number): boolean {
    return new Decimal(this.balance).greaterThanOrEqualTo(amount);
  }
}
