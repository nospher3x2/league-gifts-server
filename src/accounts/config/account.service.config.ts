import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccountsServiceConfig {
  constructor(private readonly configService: ConfigService) {}

  get hydraUrl(): string {
    return this.configService.getOrThrow('riot.auth.hydra_url');
  }

  get hydraKey(): string {
    return this.configService.getOrThrow('riot.auth.hydra_key');
  }

  public getLoginQueueUrlByRegion(region: string): string {
    return this.configService.getOrThrow(`riot.login_queue_url.${region}`);
  }

  public getLedgeUrlByRegion(region: string): string {
    return this.configService.getOrThrow(`riot.ledge_url.${region}`);
  }
}
