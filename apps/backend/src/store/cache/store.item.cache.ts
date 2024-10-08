import { StoreItemDomain } from '@common/store';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class StoreItemCache {
  private static readonly KEY = 'store_items_catalog';
  private static readonly TTL = 60 * 30 * 1000; // 30 minutes in milliseconds
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  public async findAllItems(): Promise<StoreItemDomain[]> {
    const cachedItems = await this.cacheManager.get<string>(StoreItemCache.KEY);
    return cachedItems ? JSON.parse(cachedItems) : null;
  }

  public async findOneItemByOfferId(offerId: string): Promise<any> {
    const item = await this.cacheManager.get<string>(
      `${StoreItemCache.KEY}::${offerId}`,
    );
    return item ? JSON.parse(item) : null;
  }

  public async saveAllItems(items: StoreItemDomain[]): Promise<void> {
    await this.cacheManager.set(
      StoreItemCache.KEY,
      JSON.stringify(items),
      StoreItemCache.TTL,
    );

    await Promise.all(
      items.map((item) =>
        this.cacheManager.set(
          `${StoreItemCache.KEY}::${item.offerId}`,
          JSON.stringify(item),
          StoreItemCache.TTL,
        ),
      ),
    );
  }

  public async resetCache(): Promise<void> {
    await this.cacheManager.del(StoreItemCache.KEY);
  }
}
