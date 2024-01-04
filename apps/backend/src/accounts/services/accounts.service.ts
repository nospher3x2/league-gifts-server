import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LeagueAccountsRepository } from '../repositories/league.accounts.repository';
import {
  AuthException,
  AuthUnknownErrorException,
  Ezreal,
  Region,
} from '@ezreal';
import { LeagueAccountDomain, LeagueAccountType } from '@common/accounts';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: LeagueAccountsRepository) {}

  public async findAll(): Promise<LeagueAccountDomain[]> {
    return this.accountsRepository.findAll();
  }

  public async findAllGiftAccountsWithMinimumRpByRegion(
    region: keyof typeof Region,
    minimumRp: number,
  ): Promise<LeagueAccountDomain[]> {
    return this.accountsRepository.findAllGiftAccountsWithMinimumRpByRegion(
      region,
      minimumRp,
    );
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
    try {
      const storedAccount =
        await this.accountsRepository.findOneByUsername(username);

      if (storedAccount && !storedAccount.partnerTokenIsExpired()) {
        if (
          !authenticateOnLedge ||
          !storedAccount.sessionQueueTokenIsExpired()
        ) {
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
    } catch (error) {
      if (error instanceof AuthException) {
        const status = error instanceof AuthUnknownErrorException ? 500 : 400;
        throw new HttpException(error.message, status);
      }

      throw error;
    }
  }
}
