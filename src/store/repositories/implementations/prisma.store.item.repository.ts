import { Injectable } from '@nestjs/common';
import { StoreItemRepository } from '../store.item.repository';
import { PrismaService } from '@common';
import { StoreItemDomain } from 'src/store/entities/store.item.domain';
import { StoreItemStatus } from 'src/store/enums/store.item.status.enum';
import { CreateStoreItemDto } from 'src/store/dtos/create.store.item.dto';
import { randomUUID } from 'crypto';
import { PrismaStoreItemMapper } from '../mappers/prisma.store.item.mapper';

@Injectable()
export class PrismaStoreItemRepository implements StoreItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findAllByStatus(
    status: keyof typeof StoreItemStatus,
  ): Promise<StoreItemDomain[]> {
    const items = await this.prisma.storeItem.findMany({ where: { status } });
    return items.map(PrismaStoreItemMapper.toDomain);
  }

  public async findOneByIdAndStatus(
    id: string,
    status: keyof typeof StoreItemStatus,
  ): Promise<StoreItemDomain> {
    const item = await this.prisma.storeItem.findUnique({
      where: { id, status },
    });

    return PrismaStoreItemMapper.toDomain(item);
  }

  public async createOne(
    createStoreItemDto: CreateStoreItemDto,
  ): Promise<StoreItemDomain> {
    const item = await this.prisma.storeItem.create({
      data: {
        id: randomUUID(),
        ...createStoreItemDto,
      },
    });

    return PrismaStoreItemMapper.toDomain(item);
  }

  public async createMany(
    createStoreItemDtos: CreateStoreItemDto[],
  ): Promise<number> {
    const items = await this.prisma.storeItem.createMany({
      data: createStoreItemDtos.map((item) => ({
        id: randomUUID(),
        ...item,
      })),
    });

    return items.count;
  }
}
