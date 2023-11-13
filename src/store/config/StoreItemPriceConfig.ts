import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StoreItemPriceConfig {
  constructor(private readonly configService: ConfigService) {}

  get itemPriceByRegion(): Record<string, Record<'IP' | 'RP', number>> {
    return this.configService.get('prices');
  }
}
