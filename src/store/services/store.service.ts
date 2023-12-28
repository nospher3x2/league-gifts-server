import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StoreItemCurrency } from '../enums/store.item.currency.enum';
import { Decimal } from 'decimal.js';
import { StoreItemDomain } from '../entities/store.item.domain';
import { StoreItemPriceConfig } from '../config/store.item.price.config';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { LeagueAccountRegion } from 'src/accounts/enums/league.account.region.enum';
import { StoreItemCache } from '../cache/store.item.cache';

@Injectable()
export class StoreService {
  private readonly ITEMS_ICON_MAPPER: Record<
    string,
    (item: StoreItemDomain) => string
  > = {};

  constructor(
    private readonly storeItemPriceConfig: StoreItemPriceConfig,
    private readonly storeItemCache: StoreItemCache,
    private readonly accountsService: AccountsService,
  ) {
    this.ITEMS_ICON_MAPPER = Object.freeze({
      BOOST: () => {
        return 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-store/global/default/storefront/addon/public/img/composites/xp_boost.png';
      },
      CHAMPION: (item: StoreItemDomain) => {
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/${item.itemId}/${item.itemId}000.jpg`;
      },
      CHAMPION_SKIN: (item: StoreItemDomain) => {
        const championId = String(item.itemId).slice(0, -3);
        if (item.subInventoryType === 'RECOLOR') {
          return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-chroma-images/${championId}/${item.itemId}.png`;
        }

        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/${championId}/${item.itemId}.jpg`;
      },
      SUMMONER_ICON: (item: StoreItemDomain) => {
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${item.itemId}.jpg`;
      },
      WARD_SKIN: (item: StoreItemDomain) => {
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/wardskinimages/wardhero_${item.itemId}.png`;
      },
      // EMOTE: (item: any) => {
      //   // const icon = EMOTES.find(
      //   //   (emote: any) => emote.id === item.itemId,
      //   // ).inventoryIcon.split('/SummonerEmotes/')[1];
      //   // return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/summoneremotes/${icon.toLowerCase()}`;
      // },
      // TFT_MAP_SKIN: (item: any) => {
      //   // const icon = TFT_MAP_SKINS.find(
      //   //   (map: any) => map.itemId === item.itemId,
      //   // ).loadoutsIcon.split('/TFTMapSkins/')[1];
      //   // return `https://raw.communitydragon.org/latest/game/assets/loadouts/tftmapskins/${icon.toLowerCase()}`;
      // },
    });
  }

  public async findAllStoreItems(): Promise<StoreItemDomain[]> {
    const cachedItems = await this.storeItemCache.findAllItems();
    if (cachedItems) {
      return cachedItems;
    }

    const items = await this.getStoreItemsCatalog();
    await this.storeItemCache.saveAllItems(items);
    return items;
  }

  public async findOneStoreItemByOfferId(
    offerId: string,
  ): Promise<StoreItemDomain> {
    const cachedItem = await this.storeItemCache.findOneItemById(offerId);
    if (cachedItem) {
      return cachedItem;
    }

    const items = await this.findAllStoreItems();
    for (const item of items) {
      if (item.offerId === offerId) {
        return item;
      }
    }

    return null;
  }

  public async repopulateStoreItemsCache(): Promise<void> {
    const catalog = await this.getStoreItemsCatalog();
    await this.storeItemCache.resetCache();
    await this.storeItemCache.saveAllItems(catalog);
  }

  public async getStoreItemsCatalog(): Promise<StoreItemDomain[]> {
    // Why? Because if we define a static region, maybe the region will be in maintenance
    let account = null;
    for (const region of Object.values(LeagueAccountRegion)) {
      try {
        account = await this.accountsService.findOneManagerAccount(region);
        if (account) {
          break;
        }
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    if (!account) {
      throw new InternalServerErrorException(
        'No manager account found in any region',
      );
    }

    // TO-DO: Use i18n to get the item name in the user language
    const catalog: StoreItemDomain[] = [];
    const offers = await this.accountsService.getAccountStoreCatalog(account);
    for (const offer of offers) {
      if (!offer.active) {
        continue;
      }

      const isHextech =
        offer.subInventoryType &&
        offer.subInventoryType === 'HEXTECH_BUNDLE' &&
        (!offer.tags || !offer.tags.includes('tft'));

      if (isHextech) {
        if (!offer.bundleItems || offer.bundleItems.length === 0) {
          continue;
        }

        if (offer.bundleItems[0].item.inventoryType !== 'EVENT_PASS') {
          continue;
        }
      }

      const name = this.getItemName(offer);
      if (!name) {
        continue;
      }

      const price = this.getItemPrice(offer, StoreItemCurrency.RP);
      if (price === 0) {
        continue;
      }

      const iconUrl = this.getItemIconUrl(offer);
      if (!iconUrl.startsWith('http')) {
        continue;
      }

      catalog.push({
        itemId: offer.itemId,
        inventoryType: offer.inventoryType,
        subInventoryType: offer.subInventoryType,
        iconUrl,
        currency: StoreItemCurrency.RP,
        price: price,
        name: this.getItemName(offer),
        offerId: offer.offerId,
      });
    }

    return catalog;
  }

  public getItemName(item: any, locale: string = 'en_US'): string {
    if (item.localizations && item.localizations[locale]) {
      return item.localizations[locale].name;
    }

    return null;
  }

  public getItemIconUrl(item: any): string {
    if (item.iconUrl.startsWith('http')) {
      return item.iconUrl;
    }

    if (item.iconUrl.startsWith('//')) {
      return `https:${item.iconUrl}`;
    }

    if (this.ITEMS_ICON_MAPPER[item.inventoryType]) {
      return this.ITEMS_ICON_MAPPER[item.inventoryType](item);
    }

    return item.iconUrl;
  }

  public getItemPrice(
    item: any,
    currency: keyof typeof StoreItemCurrency,
  ): number {
    if (item.prices.length === 0) {
      const isBundle = item.bundleItems && item.bundleItems.length > 0;
      if (!isBundle) {
        return 0;
      }

      let price = 0;
      for (const bundleItem of item.bundleItems) {
        price += bundleItem.price.cost;
      }

      return price;
    }

    const hasSale =
      item.sale && item.sale.prices && item.sale.prices.length > 0;

    if (hasSale) {
      for (const price of item.sale.prices) {
        if (price.currency === currency) {
          return price.cost;
        }
      }
    }

    for (const price of item.prices) {
      if (price.currency === currency) {
        return price.cost;
      }
    }

    return 0;
  }

  public getFlatItemPriceByRegion(
    price: number,
    currency: keyof typeof StoreItemCurrency,
    region: keyof typeof LeagueAccountRegion,
  ) {
    return Decimal.mul(
      price,
      this.storeItemPriceConfig.getCurrencyPriceByRegion(currency, region),
    )
      .toDecimalPlaces(2, Decimal.ROUND_DOWN)
      .toNumber();
  }
}
