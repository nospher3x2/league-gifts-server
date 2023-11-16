import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StoreItemCurrency } from '../enums/store.item.currency.enum';

@Injectable()
export class StoreItemPriceConfig {
  constructor(private readonly configService: ConfigService) {}

  public getCurrencyPriceByRegion(
    currency: keyof typeof StoreItemCurrency,
    region: string,
  ) {
    return this.configService.getOrThrow(`store.prices.${region}.${currency}`);
  }
}
