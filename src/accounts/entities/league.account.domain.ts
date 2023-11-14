import { Exclude } from 'class-transformer';

export class LeagueAccountDomain {
  public id: string;
  public region: string;
  public username: string;
  @Exclude()
  public password: string;
  public rp: number;
  public ip: number;
  @Exclude()
  public partnerToken: string;
  @Exclude()
  public partnerTokenExpireAt: Date;
  @Exclude()
  public createdAt: Date;
  @Exclude()
  public updatedAt: Date;

  constructor(partial: Partial<LeagueAccountDomain>) {
    Object.assign(this, partial);
  }

  public partnerTokenIsExpired(): boolean {
    return this.partnerTokenExpireAt.getTime() < Date.now();
  }
}
