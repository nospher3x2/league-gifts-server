import { Injectable } from '@nestjs/common';
import { StoreItemRepository } from '../store.item.repository';
import { PrismaService } from '@common';
import { StoreItemDomain } from 'src/store/entities/store.item.domain';
import { StoreItemStatus } from 'src/store/enums/store.item.status.enum';
import { CreateStoreItemDto } from 'src/store/dtos/create.store.item.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PrismaStoreItemRepository implements StoreItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  public findAllByStatus(
    status: keyof typeof StoreItemStatus,
  ): Promise<StoreItemDomain[]> {
    return this.prisma.storeItem.findMany({ where: { status } });
  }

  public findOneByIdAndStatus(
    id: string,
    status: keyof typeof StoreItemStatus,
  ): Promise<StoreItemDomain> {
    return this.prisma.storeItem.findUnique({ where: { id, status } });
  }

  public createOne(
    createStoreItemDto: CreateStoreItemDto,
  ): Promise<StoreItemDomain> {
    return this.prisma.storeItem.create({
      data: {
        id: randomUUID(),
        ...createStoreItemDto,
      },
    });
  }
}
