import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { StoreItemDomain } from '../entities/store.item.domain';

@Injectable()
export class StoreItemCache {
  private static readonly KEY = 'store_items_catalog';
  private static readonly TTL = 60 * 30 * 1000; // 30 minutes in milliseconds
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  public async findAllItems(): Promise<StoreItemDomain[]> {
    const cachedItems = await this.cacheManager.get<string>(StoreItemCache.KEY);
    if (!cachedItems) {
      return null;
    }

    return JSON.parse(cachedItems);
  }

  public async findOneItemById(id: string): Promise<any> {
    return this.cacheManager.get(`${StoreItemCache.KEY}::${id}`);
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
