import { LeagueAccountDomain, LeagueAccountType } from '@common/accounts';

export abstract class LeagueAccountsRepository {
  public abstract findAll(): Promise<LeagueAccountDomain[]>;

  public abstract findAllGiftAccountsWithMinimumRpByRegion(
    region: string,
    minimumRp: number,
  ): Promise<LeagueAccountDomain[]>;

  public abstract findOneById(id: string): Promise<LeagueAccountDomain | null>;

  public abstract findOneByUsername(
    username: string,
  ): Promise<LeagueAccountDomain | null>;

  public abstract findOneByRegionAndType(
    region: string,
    type: keyof typeof LeagueAccountType,
  ): Promise<LeagueAccountDomain | null>;

  public abstract findOneWithNonExpiredPartnerTokenByRegion(
    region: string,
  ): Promise<LeagueAccountDomain | null>;

  public abstract findOneManagerWithNonExpiredSessionQueueTokenByRegion(
    region: string,
  ): Promise<LeagueAccountDomain | null>;

  public abstract upsertOne(
    leagueAccountDomain: LeagueAccountDomain,
  ): Promise<LeagueAccountDomain>;
}
