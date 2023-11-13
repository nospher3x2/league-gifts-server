import { StoreItemStatus } from '@prisma/client';
import { StoreItemDomain } from '../entities/store.item.domain';
import { CreateStoreItemDto } from '../dtos/create.store.item.dto';

export abstract class StoreItemRepository {
  public abstract findAllByStatus(
    status: keyof typeof StoreItemStatus,
  ): Promise<StoreItemDomain[]>;
  public abstract findOneByIdAndStatus(
    id: string,
    status: keyof typeof StoreItemStatus,
  ): Promise<StoreItemDomain>;
  public abstract createOne(
    createStoreItemDto: CreateStoreItemDto,
  ): Promise<StoreItemDomain>;
}
