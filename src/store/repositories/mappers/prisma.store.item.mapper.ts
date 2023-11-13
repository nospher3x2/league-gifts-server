import { StoreItem } from '@prisma/client';
import { StoreItemDomain } from 'src/store/entities/store.item.domain';

export class PrismaStoreItemMapper {
  public static toDomain(item: StoreItem): StoreItemDomain {
    if (!item) {
      return null;
    }

    return new StoreItemDomain({
      id: item.id,
      name: item.name,
      iconUrl: item.iconUrl,
      status: item.status,
      currency: item.currency,
      price: item.price,
      offerId: item.offerId,
      inventoryType: item.inventoryType,
      subInventoryType: item.subInventoryType,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }
}
