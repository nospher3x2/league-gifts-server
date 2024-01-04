import { PrismaService } from '@common';
import { Injectable } from '@nestjs/common';
import { LeagueAccountDomain, LeagueAccountType } from '@common/accounts';
import { LeagueAccountsRepository } from '../league.accounts.repository';
import { PrismaLeagueAccountsMapper } from '../mappers/prisma.league.accounts.mapper';

@Injectable()
export class PrismaLeagueAccountsRepository
  implements LeagueAccountsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  public async findAll(): Promise<LeagueAccountDomain[]> {
    const accounts = await this.prisma.leagueAccount.findMany();
    return accounts.map(PrismaLeagueAccountsMapper.toDomain);
  }

  public async findAllGiftAccountsWithMinimumRpByRegion(
    region: string,
    minimumRp: number,
  ): Promise<LeagueAccountDomain[]> {
    const accounts = await this.prisma.leagueAccount.findMany({
      where: {
        region,
        rp: {
          gte: minimumRp,
        },
        type: 'GIFT',
      },
      include: {
        orders: {
          where: {
            status: 'PENDING',
          },
          include: {
            item: true,
          },
        },
      },
    });

    return accounts
      .filter((account) => {
        const ordersLength = account.orders.length;
        if (ordersLength <= 1) {
          if (ordersLength === 0) return true;
          return account.rp - account.orders[0].item.price >= minimumRp;
        }

        const totalRp = account.orders.reduce((acc, order) => {
          return acc + order.item.price;
        }, 0);
        return account.rp - totalRp >= minimumRp;
      })
      .map(PrismaLeagueAccountsMapper.toDomain);
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

  public async findOneWithNonExpiredPartnerTokenByRegion(
    region: string,
  ): Promise<LeagueAccountDomain> {
    const account = await this.prisma.leagueAccount.findFirst({
      where: {
        region,
        partnerTokenExpireAt: {
          gt: new Date(),
        },
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
