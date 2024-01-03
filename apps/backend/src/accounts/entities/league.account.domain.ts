import { Exclude } from 'class-transformer';
import { LeagueAccountType } from '../enums/league.account.type.enum';
import { Ezreal, AccountSession, Region } from '@ezreal';
import { Summoner } from '@ezreal/interfaces/summoner.interface';

export class LeagueAccountDomain implements AccountSession {
  public id: string;
  public region: keyof typeof Region;
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

  public isManager(): boolean {
    return this.type === 'MANAGER';
  }

  public isSender(): boolean {
    return this.type === 'GIFT';
  }

  public partnerTokenIsExpired(): boolean {
    return this.partnerTokenExpireAt.getTime() < Date.now();
  }

  public sessionQueueTokenIsExpired(): boolean {
    if (!this.sessionQueueToken) return true;
    return this.sessionQueueTokenExpireAt.getTime() < Date.now();
  }

  public async getWallet(): Promise<{ rp: number; ip: number }> {
    return Ezreal.getStoreWallet(this);
  }

  public async getStoreCatalog(): Promise<any> {
    return Ezreal.getStoreCatalog(this);
  }

  public async getSummonerByPuuid(puuid: string): Promise<Summoner> {
    return Ezreal.getSummonersByPuuids(this, [puuid]).then(
      (response) => response[0],
    );
  }

  public async getSummonerPuuidByGameNameAndTagLine(
    gameName: string,
    tagLine: string,
  ): Promise<string> {
    const summoner = await Ezreal.getAliasesByGameNameAndTagLine(
      this,
      gameName,
      tagLine,
    );

    return summoner.length > 0 ? summoner[0].puuid : null;
  }
}
