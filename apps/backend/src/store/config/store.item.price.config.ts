import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Region } from '@ezreal';
import { StoreItemCurrency } from '@common/store';

@Injectable()
export class StoreItemPriceConfig {
  constructor(private readonly configService: ConfigService) {}

  public getCurrencyPriceByRegion(
    currency: keyof typeof StoreItemCurrency,
    region: keyof typeof Region,
  ) {
    return this.configService.getOrThrow(`store.prices.${region}.${currency}`);
  }
}
