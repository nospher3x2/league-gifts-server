import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthProvider, IAuthSignInResponse } from '../auth.provider';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HydraAuthProvider implements AuthProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  public async handle(
    username: string,
    password: string,
  ): Promise<IAuthSignInResponse> {
    const data = await firstValueFrom(
      this.httpService
        .post(this.configService.getOrThrow('riot.auth.hydra_url'), {
          login: username,
          pass: password,
          hnkey: this.configService.getOrThrow('riot.auth.hydra_key'),
          client_id: 'lol',
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

    if (!data) {
      throw new InternalServerErrorException(
        'No data received from Auth Provider. Contact the administrator',
      );
    }

    if (data.status !== 1) {
      throw new BadRequestException(data.error);
    }

    const {
      token: partnerToken,
      region,
      puuid,
      expiryTS: expiryTimestamp,
    } = data;
    if (!partnerToken || !region || !puuid || !expiryTimestamp) {
      throw new InternalServerErrorException(
        'Invalid data received from Auth Provider. Contact the administrator',
      );
    }

    return {
      puuid,
      region,
      partnerToken,
      partnerTokenExpireAt: new Date(expiryTimestamp * 1000),
    };
  }
}
