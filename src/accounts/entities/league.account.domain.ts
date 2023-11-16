import { Exclude } from 'class-transformer';
import { LeagueAccountType } from '../enums/league.account.type.enum';

export class LeagueAccountDomain {
  public id: string;
  public region: string;
  public username: string;
  @Exclude()
  public password: string;
  public rp: number;
  public ip: number;
  public type: keyof typeof LeagueAccountType;
  @Exclude()
  public partnerToken: string;
  @Exclude()
  public partnerTokenExpireAt: Date;
  @Exclude()
  public userInfoToken?: string;
  @Exclude()
  public sessionQueueToken?: string;
  @Exclude()
  public sessionQueueTokenExpireAt?: Date;
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

  public sessionQueueTokenIsExpired(): boolean {
    if (!this.sessionQueueToken) return true;
    return this.sessionQueueTokenExpireAt.getTime() < Date.now();
  }
}
