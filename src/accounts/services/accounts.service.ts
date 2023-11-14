import { HttpException, Injectable } from '@nestjs/common';
import { HydraAuthProvider } from '../providers/implementations/hydra.auth.provider';
import { LeagueAccountDomain } from '../entities/league.account.domain';
import { AccountsServiceConfig } from '../config/account.service.config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { LeagueAccountsRepository } from '../repositories/league.accounts.repository';

@Injectable()
export class AccountsService {
  constructor(
    private readonly configService: AccountsServiceConfig,
    private readonly httpService: HttpService,
    private readonly accountsRepository: LeagueAccountsRepository,
    private readonly authProvider: HydraAuthProvider,
  ) {}

  public async authenticate(
    username: string,
    password: string,
  ): Promise<LeagueAccountDomain> {
    const account = await this.accountsRepository.findOneByUsername(username);
    if (!account || account.partnerTokenIsExpired()) {
      const authResponse = await this.authProvider.handle(username, password);
      const wallet = await this.getAccountWallet(
        authResponse.partnerToken,
        authResponse.region,
      );

      return this.accountsRepository.upsertOne(
        authResponse.puuid,
        username,
        password,
        authResponse.region,
        wallet.ip,
        wallet.rp,
        authResponse.partnerToken,
        authResponse.partnerTokenExpireAt,
      );
    }

    return account;
  }

  private async getAccountWallet(
    partnerToken: string,
    region: string,
  ): Promise<{ ip: number; rp: number }> {
    return firstValueFrom(
      this.httpService
        .get<{ ip: number; rp: number }>(
          `${this.configService.getLedgeUrlByRegion(
            region,
          )}/storefront/v2/wallet`,
          {
            headers: {
              Authorization: `Bearer ${partnerToken}`,
            },
          },
        )
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

  public async handleLedgeRequest<T>(
    account: LeagueAccountDomain,
    path: string,
    method: string,
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
