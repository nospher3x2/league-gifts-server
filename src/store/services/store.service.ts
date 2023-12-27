import { Injectable } from '@nestjs/common';
import { StoreItemRepository } from '../repositories/store.item.repository';
import { StoreItemCurrency } from '../enums/store.item.currency.enum';
import { Decimal } from 'decimal.js';
import { CreateStoreItemDto } from '../dtos/create.store.item.dto';
import { StoreItemDomain } from '../entities/store.item.domain';
import { StoreItemPriceConfig } from '../config/store.item.price.config';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { LeagueAccountRegion } from 'src/accounts/enums/league.account.region.enum';

@Injectable()
export class StoreService {
  private readonly ITEMS_ICON_MAPPER: Record<string, (item: any) => string> =
    {};

  constructor(
    private readonly storeItemPriceConfig: StoreItemPriceConfig,
    private readonly storeItemRepository: StoreItemRepository,
    private readonly accountsService: AccountsService,
  ) {
    this.ITEMS_ICON_MAPPER = Object.freeze({
      BOOST: () => {
        return 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-store/global/default/storefront/addon/public/img/composites/xp_boost.png';
      },
      CHAMPION: (item: any) => {
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/${item.itemId}/${item.itemId}000.jpg`;
      },
      CHAMPION_SKIN: (item: any) => {
        const championId = String(item.itemId).slice(0, -3);
        if (item.subInventoryType === 'RECOLOR') {
          return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-chroma-images/${championId}/${item.itemId}.png`;
        }

        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/${championId}/${item.itemId}.jpg`;
      },
      SUMMONER_ICON: (item: any) => {
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${item.itemId}.jpg`;
      },
      WARD_SKIN: (item: any) => {
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

  public async findAllActiveItems(): Promise<StoreItemDomain[]> {
    return this.storeItemRepository.findAllByStatus('ACTIVE');
  }

  public async findOneActiveItemById(id: string): Promise<StoreItemDomain> {
    return this.storeItemRepository.findOneByIdAndStatus(id, 'ACTIVE');
  }

  public async createOneItem(
    createStoreItemDto: CreateStoreItemDto,
  ): Promise<StoreItemDomain> {
    return this.storeItemRepository.createOne(createStoreItemDto);
  }

  public async createManyItems(
    createStoreItemDtos: CreateStoreItemDto[],
  ): Promise<number> {
    return this.storeItemRepository.createMany(createStoreItemDtos);
  }

  public async seedStoreItemsWithLeagueStoreOffers(): Promise<number> {
    const account = await this.accountsService.authenticate(
      'nospherbr',
      'R14141525',
    );

    const storeOffers =
      await this.accountsService.getAccountStoreOffers(account);

    const offers = storeOffers.filter(
      (offer) => offer.offerType === 'PURCHASE',
    );

    return offers.length;
  }

  public getItemName(item: any, locale: string = 'en_US'): string {
    if (item.localizations && item.localizations[locale]) {
      return item.localization[locale].name;
    }

    return null;
  }

  public getItemIconUrl(item: any): string {
    if (item.iconUrl.startsWith('//')) {
      return `https:${item.iconUrl}`;
    }

    if (this.ITEMS_ICON_MAPPER[item.inventoryType]) {
      return this.ITEMS_ICON_MAPPER[item.inventoryType](item);
    }

    return item.iconUrl;
  }

  public getFlatItemPriceByRegion(
    price: number,
    currency: keyof typeof StoreItemCurrency,
    region: keyof typeof LeagueAccountRegion,
  ) {
    return Decimal.mul(
      price,
      this.storeItemPriceConfig.getCurrencyPriceByRegion(currency, region),
    ).toNumber();
  }
}
