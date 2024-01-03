import axios, { AxiosError } from 'axios';
import { AuthProvider } from '../auth.provider';
import { AccountSession } from '@ezreal/interfaces/account.session.interface';
import { EzrealConfig } from '@ezreal/config/ezreal.config';
import { Region } from '@ezreal/enums/region.enum';
import { AuthUnknownErrorException } from '@ezreal/exceptions/auth.unknown.error.exception';
import { AuthSyntaxErrorException } from '@ezreal/exceptions/auth.syntax.error.exception';
import { AuthInvalidCredentialsException } from '@ezreal/exceptions/auth.invalid.credentials.exception';
import { AuthMultifactorEnabledException } from '@ezreal/exceptions/auth.multifactor.enabled.exception';

interface HydraAuthResponse {
  status: number;
}

interface HydraAuthSuccessResponse extends HydraAuthResponse {
  login: string;
  pass: string;
  client_id: string;
  token: string;
  puuid: string;
  uid: number;
  region: keyof typeof Region;
  gametype: string;
  expiry: string;
  expiryTS: number;
  AuthServer: string;
  from: string;
  date: string;
}

interface HydraAuthErrorResponse extends HydraAuthResponse {
  error: string;
  INFO?: string;
}

export class HydraAuthProvider implements AuthProvider {
  constructor(private readonly config: EzrealConfig) {}
  public async handle(
    username: string,
    password: string,
    clientId: string = 'lol',
  ): Promise<AccountSession> {
    const data = await axios
      .post<HydraAuthSuccessResponse>(this.config.HYDRA_AUTH_URL, {
        login: username,
        pass: password,
        hnkey: this.config.HYDRA_AUTH_KEY,
        client_id: clientId,
      })
      .then((response) => response.data)
      .catch((error: AxiosError<HydraAuthErrorResponse>) => {
        const data = error?.response?.data;
        if (!data) {
          throw new AuthUnknownErrorException('No data received');
        }

        const errorMessage = data.error;
        if (errorMessage === 'Syntax error') {
          throw new AuthSyntaxErrorException(data.INFO);
        }

        if (data.INFO) {
          throw new AuthUnknownErrorException(data.INFO);
        }

        switch (errorMessage) {
          case 'auth_failure':
            throw new AuthInvalidCredentialsException();
          case 'ACCOUNT BLOCKED - 2FA - MULTIFACTOR':
            throw new AuthMultifactorEnabledException();
          default:
            throw new AuthUnknownErrorException(errorMessage);
        }
      });

    if (!data || data.status !== 1) {
      throw new AuthUnknownErrorException('Invalid data received');
    }

    const {
      token: partnerToken,
      region,
      puuid,
      expiryTS: expiryTimestamp,
    } = data;
    if (!partnerToken || !region || !puuid || !expiryTimestamp) {
      throw new AuthUnknownErrorException('Missing important data in response');
    }

    return {
      id: puuid,
      region,
      partnerToken,
      partnerTokenExpireAt: new Date(expiryTimestamp * 1000),
    };
  }
}
