import { StoreItemStatus } from '@prisma/client';
import { StoreItemDomain } from '../entities/store.item.domain';

export abstract class StoreItemRepository {
  public abstract findAllByStatus(
    status: StoreItemStatus,
  ): Promise<StoreItemDomain[]>;
  public abstract findOneByIdAndStatus(
    id: string,
    status: StoreItemStatus,
  ): Promise<StoreItemDomain>;
}
