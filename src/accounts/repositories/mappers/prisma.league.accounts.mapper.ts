import { LeagueAccount } from '@prisma/client';
import { LeagueAccountDomain } from 'src/accounts/entities/league.account.domain';

export class PrismaLeagueAccountsMapper {
  public static toDomain(account: LeagueAccount): LeagueAccountDomain {
    if (!account) {
      return null;
    }

    return new LeagueAccountDomain({
      id: account.id,
      username: account.username,
      password: account.password,
      region: account.region,
      rp: account.rp,
      ip: account.ip,
      type: account.type,
      partnerToken: account.partnerToken,
      partnerTokenExpireAt: account.partnerTokenExpireAt,
      userInfoToken: account.userInfoToken,
      sessionQueueToken: account.sessionQueueToken,
      sessionQueueTokenExpireAt: account.sessionQueueTokenExpireAt,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });
  }
}
