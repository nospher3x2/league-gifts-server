import { Injectable } from '@nestjs/common';
import { StoreItemRepository } from '../store.item.repository';
import { PrismaService } from '@common';
import { StoreItemDomain } from 'src/store/entities/store.item.domain';
import { StoreItemStatus } from '@prisma/client';

@Injectable()
export class PrismaStoreItemRepository implements StoreItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  public findAllByStatus(status: StoreItemStatus): Promise<StoreItemDomain[]> {
    return this.prisma.storeItem.findMany({ where: { status } });
  }

  public findOneByIdAndStatus(
    id: string,
    status: StoreItemStatus,
  ): Promise<StoreItemDomain> {
    return this.prisma.storeItem.findUnique({ where: { id, status } });
  }
}
