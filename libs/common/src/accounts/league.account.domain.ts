import { Exclude } from 'class-transformer';
import { Ezreal, AccountSession, Region } from '@ezreal';
import { Summoner } from '@ezreal/interfaces/summoner.interface';
import { LeagueAccountType } from './league.account.type.enum';
import { Nameset } from '@ezreal/interfaces/nameset.interface';

export class LeagueAccountDomain implements AccountSession {
  public id: string;
  public region: keyof typeof Region;
  public username: string;
  @Exclude()
  public password: string;
  public name: string;
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
    const summoner = await Ezreal.getSummonersByPuuids(this, [puuid]);
    return summoner.length > 0 ? summoner[0] : null;
  }

  public async getSummonerNamesetByPuuid(puuid: string): Promise<Nameset> {
    const summoner = await Ezreal.getNamesetByPuuids(this, [puuid]);
    return summoner.length > 0 ? summoner[0] : null;
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
