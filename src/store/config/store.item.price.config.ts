import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StoreItemCurrency } from '../enums/store.item.currency.enum';
import { LeagueAccountRegion } from 'src/accounts/enums/league.account.region.enum';

@Injectable()
export class StoreItemPriceConfig {
  constructor(private readonly configService: ConfigService) {}

  public getCurrencyPriceByRegion(
    currency: keyof typeof StoreItemCurrency,
    region: keyof typeof LeagueAccountRegion,
  ) {
    return this.configService.getOrThrow(`store.prices.${region}.${currency}`);
  }
}
