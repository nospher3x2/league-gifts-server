import { LeagueAccountDomain } from '../entities/league.account.domain';
import { LeagueAccountType } from '../enums/league.account.type.enum';

export abstract class LeagueAccountsRepository {
  public abstract findOneById(id: string): Promise<LeagueAccountDomain | null>;

  public abstract findOneByUsername(
    username: string,
  ): Promise<LeagueAccountDomain | null>;

  public abstract findOneByRegionAndType(
    region: string,
    type: keyof typeof LeagueAccountType,
  ): Promise<LeagueAccountDomain | null>;

  public abstract findOneManagerWithNonExpiredSessionQueueTokenByRegion(
    region: string,
  ): Promise<LeagueAccountDomain | null>;

  public abstract upsertOne(
    leagueAccountDomain: LeagueAccountDomain,
  ): Promise<LeagueAccountDomain>;
}
