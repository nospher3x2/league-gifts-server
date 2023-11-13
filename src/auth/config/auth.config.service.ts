import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get jwtSecretKey(): string {
    return this.configService.getOrThrow<string>('jwt_secret_key');
  }

  public get jwtExpiresIn(): string {
    return this.configService.getOrThrow<string>('jwt_expires_in');
  }

  public get emailVerificationIsEnabled(): boolean {
    return this.configService.get<boolean>('mail_enabled');
  }
}
