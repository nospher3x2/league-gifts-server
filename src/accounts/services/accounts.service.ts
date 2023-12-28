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
import { LeagueAccountType } from '../enums/league.account.type.enum';
import { Summoner } from '../interfaces/Summoner';

@Injectable()
export class AccountsService {
  constructor(
    private readonly configService: AccountsServiceConfig,
    private readonly httpService: HttpService,
    private readonly accountsRepository: LeagueAccountsRepository,
    private readonly authProvider: AuthProvider,
  ) {}

  public async findAll(): Promise<LeagueAccountDomain[]> {
    return this.accountsRepository.findAll();
  }

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

    return await this.authenticate(
      managerAccount.username,
      managerAccount.password,
      'MANAGER',
    );
  }

  public async authenticate(
    username: string,
    password: string,
    type: keyof typeof LeagueAccountType = 'GIFT',
  ): Promise<LeagueAccountDomain> {
    const storedAccount =
      await this.accountsRepository.findOneByUsername(username);
    if (storedAccount && !storedAccount.partnerTokenIsExpired()) {
      if (type === 'MANAGER' && storedAccount.sessionQueueTokenIsExpired()) {
        await this.authenticateOnLedge(storedAccount);
      }

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
      type,
    });

    const wallet = await this.getAccountWallet(account);
    account.ip = wallet.ip;
    account.rp = wallet.rp;

    if (type === 'MANAGER') {
      const userInfoToken = await this.getAccountUserInfoToken(account);
      account.userInfoToken = userInfoToken;

      const sessionQueueToken = await this.getAccountSessionQueueToken(account);
      account.sessionQueueToken = sessionQueueToken.sessionQueueToken;
      account.sessionQueueTokenExpireAt =
        sessionQueueToken.sessionQueueTokenExpireAt;
    }

    console.log(account);
    return this.accountsRepository.upsertOne(account);
  }

  public async authenticateOnLedge(
    account: LeagueAccountDomain,
  ): Promise<void> {
    const userInfoToken = await this.getAccountUserInfoToken(account);
    account.userInfoToken = userInfoToken;

    const sessionQueueToken = await this.getAccountSessionQueueToken(account);
    account.sessionQueueToken = sessionQueueToken.sessionQueueToken;
    account.sessionQueueTokenExpireAt =
      sessionQueueToken.sessionQueueTokenExpireAt;
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
          `${this.configService.getLoginQueueUrlByRegion(
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
          `${this.configService.getLoginQueueUrlByRegion(
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

  public async getAliasesByGameNameAndTagLine(
    account: LeagueAccountDomain,
    gameName: string,
    tagLine: string,
  ): Promise<{ puuid: string }> {
    return await firstValueFrom(
      this.httpService
        .get<{ puuid: string }[]>(
          `${this.configService.riotGamesAccountApiUrl}/aliases/v1/aliases`,
          {
            params: {
              gameName,
              tagLine,
            },
            headers: {
              Authorization: `Bearer ${account.partnerToken}`,
            },
          },
        )
        .pipe(
          map((response) => response.data[0]),
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
  }

  public async getSummonerByPuuid(
    account: LeagueAccountDomain,
    puuid: string,
  ): Promise<Summoner> {
    return this.handleLedgeRequest<Summoner[]>(
      account,
      'GET',
      `summoner-ledge/v1/regions/${
        account.region
      }/summoners/puuids/${encodeURIComponent(puuid)}`,
    ).then((summoners) => summoners[0]);
  }

  public async getAccountWallet(
    account: LeagueAccountDomain,
  ): Promise<{ ip: number; rp: number }> {
    return this.handleLedgeRequest<{ ip: number; rp: number }>(
      account,
      'GET',
      'storefront/v2/wallet',
    );
  }

  public async getAccountStoreCatalog(
    account: LeagueAccountDomain,
  ): Promise<any[]> {
    return this.handleLedgeRequest<any[]>(
      account,
      'GET',
      `storefront/v1/catalog?region=${encodeURIComponent(
        account.region,
      )}&language=en_US`,
    );
  }

  public async handleLedgeRequest<T>(
    account: LeagueAccountDomain,
    method: string,
    path: string,
    body?: any,
  ): Promise<T> {
    const token = path.includes('storefront/')
      ? account.partnerToken
      : account.sessionQueueToken;

    return firstValueFrom(
      this.httpService
        .request<T>({
          url: `${this.configService.getLedgeUrlByRegion(
            account.region,
          )}/${path}`,
          method,
          data: body,
          headers: {
            Authorization: `Bearer ${token}`,
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
