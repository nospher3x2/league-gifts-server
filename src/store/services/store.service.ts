import { Injectable } from '@nestjs/common';
import { StoreItemRepository } from '../repositories/store.item.repository';
import { StoreItemCurrency } from '../enums/store.item.currency.enum';
import { Decimal } from 'decimal.js';
import { CreateStoreItemDto } from '../dtos/create.store.item.dto';
import { StoreItemDomain } from '../entities/store.item.domain';
import { StoreItemPriceConfig } from '../config/store.item.price.config';

@Injectable()
export class StoreService {
  constructor(
    private readonly storeItemPriceConfig: StoreItemPriceConfig,
    private readonly storeItemRepository: StoreItemRepository,
  ) {}

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

  public getFlatItemPriceByRegion(
    price: number,
    currency: keyof typeof StoreItemCurrency,
    region: string,
  ) {
    const priceBase = new Decimal(
      this.storeItemPriceConfig.itemPriceByRegion[region][currency],
    );

    return Decimal.mul(price, priceBase).toNumber();
  }
}
