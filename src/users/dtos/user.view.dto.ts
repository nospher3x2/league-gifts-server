import { Expose } from 'class-transformer';

export class UserViewDto {
  @Expose()
  public readonly id: string;
  @Expose()
  public readonly email: string;
  @Expose()
  public readonly name: string;
  @Expose()
  public readonly balance: number;
  @Expose()
  public readonly role: string;
  @Expose()
  public readonly status: string;

  constructor(partial: Partial<UserViewDto>) {
    Object.assign(this, partial);
  }
}
