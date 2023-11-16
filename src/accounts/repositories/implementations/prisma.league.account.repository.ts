import { PrismaService } from '@common';
import { Injectable } from '@nestjs/common';
import { LeagueAccountDomain } from 'src/accounts/entities/league.account.domain';
import { LeagueAccountsRepository } from '../league.accounts.repository';
import { PrismaLeagueAccountsMapper } from '../mappers/prisma.league.accounts.mapper';
import { LeagueAccountType } from 'src/accounts/enums/league.account.type.enum';

@Injectable()
export class PrismaLeagueAccountsRepository
  implements LeagueAccountsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  public async findAll(): Promise<LeagueAccountDomain[]> {
    const accounts = await this.prisma.leagueAccount.findMany();
    return accounts.map(PrismaLeagueAccountsMapper.toDomain);
  }

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

  public async findOneByRegionAndType(
    region: string,
    type: keyof typeof LeagueAccountType,
  ): Promise<LeagueAccountDomain> {
    const account = await this.prisma.leagueAccount.findFirst({
      where: {
        region,
        type,
      },
    });

    return PrismaLeagueAccountsMapper.toDomain(account);
  }

  public async findOneManagerWithNonExpiredSessionQueueTokenByRegion(
    region: string,
  ): Promise<LeagueAccountDomain> {
    const account = await this.prisma.leagueAccount.findFirst({
      where: {
        region,
        type: 'MANAGER',
        sessionQueueTokenExpireAt: {
          gt: new Date(),
        },
      },
    });

    return PrismaLeagueAccountsMapper.toDomain(account);
  }

  public async upsertOne(
    leagueAccountDomain: LeagueAccountDomain,
  ): Promise<LeagueAccountDomain> {
    const account = await this.prisma.leagueAccount.upsert({
      where: {
        id: leagueAccountDomain.id,
      },
      update: {
        password: leagueAccountDomain.password,
        region: leagueAccountDomain.region,
        ip: leagueAccountDomain.ip,
        rp: leagueAccountDomain.rp,
        type: leagueAccountDomain.type,
        partnerToken: leagueAccountDomain.partnerToken,
        partnerTokenExpireAt: leagueAccountDomain.partnerTokenExpireAt,
        userInfoToken: leagueAccountDomain.userInfoToken,
        sessionQueueToken: leagueAccountDomain.sessionQueueToken,
        sessionQueueTokenExpireAt:
          leagueAccountDomain.sessionQueueTokenExpireAt,
      },
      create: {
        id: leagueAccountDomain.id,
        username: leagueAccountDomain.username,
        password: leagueAccountDomain.password,
        region: leagueAccountDomain.region,
        ip: leagueAccountDomain.ip,
        rp: leagueAccountDomain.rp,
        type: leagueAccountDomain.type,
        partnerToken: leagueAccountDomain.partnerToken,
        partnerTokenExpireAt: leagueAccountDomain.partnerTokenExpireAt,
        userInfoToken: leagueAccountDomain.userInfoToken,
        sessionQueueToken: leagueAccountDomain.sessionQueueToken,
        sessionQueueTokenExpireAt:
          leagueAccountDomain.sessionQueueTokenExpireAt,
      },
    });

    return PrismaLeagueAccountsMapper.toDomain(account);
  }
}
