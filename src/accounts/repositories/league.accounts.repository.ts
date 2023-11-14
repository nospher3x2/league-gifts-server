import { LeagueAccountDomain } from '../entities/league.account.domain';

export abstract class LeagueAccountsRepository {
  public abstract findOneById(id: string): Promise<LeagueAccountDomain | null>;
  public abstract findOneByUsername(
    username: string,
  ): Promise<LeagueAccountDomain | null>;
  public abstract upsertOne(
    id: string,
    username: string,
    password: string,
    region: string,
    ip: number,
    rp: number,
    partnerToken: string,
    partnerTokenExpireAt: Date,
  ): Promise<LeagueAccountDomain>;
}
