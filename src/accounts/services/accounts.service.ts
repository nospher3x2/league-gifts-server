import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LeagueAccountDomain } from '../entities/league.account.domain';
import { HttpService } from '@nestjs/axios';
import { LeagueAccountsRepository } from '../repositories/league.accounts.repository';
import { LeagueAccountType } from '../enums/league.account.type.enum';
import { Ezreal, Region } from '@ezreal';

@Injectable()
export class AccountsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly accountsRepository: LeagueAccountsRepository,
  ) {}

  public async findAll(): Promise<LeagueAccountDomain[]> {
    return this.accountsRepository.findAll();
  }

  public async findOneManagerAccount(
    region: keyof typeof Region,
    authenticateOnLedge: boolean = true,
  ): Promise<LeagueAccountDomain> {
    const account = authenticateOnLedge
      ? await this.accountsRepository.findOneManagerWithNonExpiredSessionQueueTokenByRegion(
          region,
        )
      : await this.accountsRepository.findOneWithNonExpiredPartnerTokenByRegion(
          region,
        );

    if (account) {
      return account;
    }

    const managerAccount = await this.accountsRepository.findOneByRegionAndType(
      region,
      'MANAGER',
    );

    if (!managerAccount) {
      throw new InternalServerErrorException(
        `No manager account found for region ${region}`,
      );
    }

    return this.authenticate(
      managerAccount.username,
      managerAccount.password,
      'MANAGER',
      authenticateOnLedge,
    );
  }

  public async authenticate(
    username: string,
    password: string,
    type: keyof typeof LeagueAccountType = 'GIFT',
    authenticateOnLedge: boolean = type === 'MANAGER',
  ): Promise<LeagueAccountDomain> {
    const storedAccount =
      await this.accountsRepository.findOneByUsername(username);

    if (storedAccount && !storedAccount.partnerTokenIsExpired()) {
      if (!authenticateOnLedge || !storedAccount.sessionQueueTokenIsExpired()) {
        console.log(1);
        return storedAccount;
      }

      await Ezreal.authenticateOnLedge(storedAccount);
      await this.accountsRepository.upsertOne(storedAccount);
      return storedAccount;
    }

    const session = await Ezreal.authenticate(
      username,
      password,
      authenticateOnLedge,
    );

    console.log(session);

    const account = new LeagueAccountDomain({
      id: session.id,
      region: session.region,
      username: username,
      password: password,
      rp: storedAccount ? storedAccount.rp : 0,
      ip: storedAccount ? storedAccount.ip : 0,
      type: type,
      partnerToken: session.partnerToken,
      partnerTokenExpireAt: session.partnerTokenExpireAt,
      userInfoToken: session.userInfoToken ?? storedAccount?.userInfoToken,
      sessionQueueToken:
        session.sessionQueueToken ?? storedAccount?.sessionQueueToken,
      sessionQueueTokenExpireAt:
        session.sessionQueueTokenExpireAt ??
        storedAccount?.sessionQueueTokenExpireAt,
    });

    if (account.isSender()) {
      const wallet = await account.getWallet();
      account.ip = wallet.ip;
      account.rp = wallet.rp;
    }

    return this.accountsRepository.upsertOne(account);
  }
}
