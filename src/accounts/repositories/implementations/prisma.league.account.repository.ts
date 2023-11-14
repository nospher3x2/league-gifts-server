import { PrismaService } from '@common';
import { Injectable } from '@nestjs/common';
import { LeagueAccountDomain } from 'src/accounts/entities/league.account.domain';
import { LeagueAccountsRepository } from '../league.accounts.repository';
import { PrismaLeagueAccountsMapper } from '../mappers/prisma.league.accounts.mapper';

@Injectable()
export class PrismaLeagueAccountsRepository
  implements LeagueAccountsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  public async findOneById(id: string): Promise<LeagueAccountDomain> {
    const account = await this.prisma.leagueAccount.findUnique({
      where: {
        id,
      },
    });

    return PrismaLeagueAccountsMapper.toDomain(account);
  }

  public async findOneByUsername(
    username: string,
  ): Promise<LeagueAccountDomain> {
    const account = await this.prisma.leagueAccount.findFirst({
      where: {
        username,
      },
    });

    return PrismaLeagueAccountsMapper.toDomain(account);
  }

  public async upsertOne(
    id: string,
    username: string,
    password: string,
    region: string,
    ip: number,
    rp: number,
    partnerToken: string,
    partnerTokenExpireAt: Date,
  ): Promise<LeagueAccountDomain> {
    const account = await this.prisma.leagueAccount.upsert({
      where: {
        id,
      },
      update: {
        password,
        region,
        ip,
        rp,
        partnerToken,
        partnerTokenExpireAt,
      },
      create: {
        id,
        username,
        password,
        region,
        ip,
        rp,
        partnerToken,
        partnerTokenExpireAt,
      },
    });

    return PrismaLeagueAccountsMapper.toDomain(account);
  }
}
