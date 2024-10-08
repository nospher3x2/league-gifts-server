import { LeagueAccountDomain } from '@common/accounts';
import { Region } from '@ezreal';
import { LeagueAccount } from '@prisma/client';

export class PrismaLeagueAccountsMapper {
  public static toDomain(account: LeagueAccount): LeagueAccountDomain {
    if (!account) {
      return null;
    }

    return new LeagueAccountDomain({
      id: account.id,
      region: account.region as keyof typeof Region,
      username: account.username,
      password: account.password,
      name: account.name,
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
