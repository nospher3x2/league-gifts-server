import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LeagueAccountDomain } from '../entities/league.account.domain';
import { AccountsServiceConfig } from '../config/account.service.config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { LeagueAccountsRepository } from '../repositories/league.accounts.repository';
import { AuthProvider } from '../providers/auth.provider';
import { ISummoner } from '../interfaces/ISummoner';

@Injectable()
export class AccountsService {
  constructor(
    private readonly configService: AccountsServiceConfig,
    private readonly httpService: HttpService,
    private readonly accountsRepository: LeagueAccountsRepository,
    private readonly authProvider: AuthProvider,
  ) {}

  public async findOneManagerAccount(
    region: string,
  ): Promise<LeagueAccountDomain> {
    const account =
      await this.accountsRepository.findOneManagerWithNonExpiredSessionQueueTokenByRegion(
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

    const authResponse = await this.authProvider.handle(
      managerAccount.username,
      managerAccount.password,
    );

    managerAccount.partnerToken = authResponse.partnerToken;
    managerAccount.partnerTokenExpireAt = authResponse.partnerTokenExpireAt;

    const userInfoToken = await this.getAccountUserInfoToken(account);
    account.userInfoToken = userInfoToken;

    const sessionQueueToken = await this.getAccountSessionQueueToken(account);
    account.sessionQueueToken = sessionQueueToken.sessionQueueToken;
    account.sessionQueueTokenExpireAt =
      sessionQueueToken.sessionQueueTokenExpireAt;

    return this.accountsRepository.upsertOne(account);
  }

  public async authenticate(
    username: string,
    password: string,
  ): Promise<LeagueAccountDomain> {
    const storedAccount =
      await this.accountsRepository.findOneByUsername(username);
    if (storedAccount && !storedAccount.partnerTokenIsExpired()) {
      return storedAccount;
    }

    const authResponse = await this.authProvider.handle(username, password);
    const account = new LeagueAccountDomain({
      id: authResponse.puuid,
      region: authResponse.region,
      username,
      password,
      partnerToken: authResponse.partnerToken,
      partnerTokenExpireAt: authResponse.partnerTokenExpireAt,
      type: 'GIFT',
    });

    const wallet = await this.getAccountWallet(account);
    account.ip = wallet.ip;
    account.rp = wallet.rp;

    return this.accountsRepository.upsertOne(account);
  }

  public async getAccountUserInfoToken(
    account: LeagueAccountDomain,
  ): Promise<string> {
    return await firstValueFrom(
      this.httpService
        .post(
          'https://auth.riotgames.com/userinfo',
          {},
          {
            headers: {
              Authorization: `Bearer ${account.partnerToken}`,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            const data = error?.response?.data;
            throw new HttpException(
              data.message || data,
              error.response.status,
              {
                description: data.errorCode,
                cause: error,
              },
            );
          }),
        ),
    );
  }

  public async getAccountSessionQueueToken(
    account: LeagueAccountDomain,
  ): Promise<{ sessionQueueToken: string; sessionQueueTokenExpireAt: Date }> {
    const session = await firstValueFrom(
      this.httpService
        .post(
          `${this.configService.getLedgeUrlByRegion(
            account.region,
          )}/login-queue/v2/login/products/lol/regions/${account.region}`,
          {
            clientName: 'lcu',
            userinfo: account.userInfoToken,
          },
          {
            headers: {
              Authorization: `Bearer ${account.partnerToken}`,
            },
          },
        )
        .pipe(
          map((response) => response.data.token),
          catchError((error) => {
            const data = error.response.data;
            throw new HttpException(
              data.message || data,
              error.response.status,
              {
                description: data.errorCode,
                cause: error,
              },
            );
          }),
        ),
    );

    if (!session) {
      throw new BadRequestException(
        'No session received from Login Queue. (ERROR: 0x7)',
      );
    }

    const token = await firstValueFrom(
      this.httpService
        .post<string>(
          `${this.configService.getLedgeUrlByRegion(
            account.region,
          )}/session-external/v1/session/create`,
          {
            claims: {
              cname: 'lcu',
            },
            product: 'lol',
            puuid: account.id,
            region: account.region.toLowerCase(),
          },
          {
            headers: {
              Authorization: `Bearer ${session}`,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            const data = error?.response?.data || error.response;
            throw new HttpException(
              data.message || data,
              error.response.status,
              {
                description: data.errorCode || data,
                cause: error,
              },
            );
          }),
        ),
    );

    return {
      sessionQueueToken: token,
      sessionQueueTokenExpireAt: new Date(Date.now() + 10 * 60 * 1000),
    };
  }

  public async getSummonerByName(
    account: LeagueAccountDomain,
    summonerName: string,
  ): Promise<ISummoner> {
    return this.handleLedgeRequest<ISummoner>(
      account,
      'GET',
      `/summoner-ledge/v1/regions/${
        account.region
      }/summoners/name/${encodeURIComponent(summonerName)}`,
    );
  }

  public async getAccountWallet(
    account: LeagueAccountDomain,
  ): Promise<{ ip: number; rp: number }> {
    return this.handleLedgeRequest<{ ip: number; rp: number }>(
      account,
      'GET',
      '/storefront/v2/wallet',
    );
  }

  public async getAccountStoreOffers(
    account: LeagueAccountDomain,
  ): Promise<any[]> {
    return this.handleLedgeRequest<any[]>(
      account,
      'GET',
      '/storefront/v1/offers',
    );
  }

  public async handleLedgeRequest<T>(
    account: LeagueAccountDomain,
    method: string,
    path: string,
    body?: any,
  ): Promise<T> {
    return firstValueFrom(
      this.httpService
        .request<T>({
          url: `${this.configService.getLedgeUrlByRegion(
            account.region,
          )}/${path}`,
          method,
          data: body,
          headers: {
            Authorization: `Bearer ${account.partnerToken}`,
          },
        })
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            const data = error?.response?.data;
            throw new HttpException(data.error || data, error.response.status, {
              description: data.errorCode,
              cause: error,
            });
          }),
        ),
    );
  }
}
