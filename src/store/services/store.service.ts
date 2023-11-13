import { Injectable } from '@nestjs/common';
import { StoreItemRepository } from '../repositories/store.item.repository';

@Injectable()
export class StoreService {
  constructor(private readonly storeItemRepository: StoreItemRepository) {}

  public async findAllActiveItems() {
    return this.storeItemRepository.findAllByStatus('ACTIVE');
  }

  public async findOneActiveItemById(id: string) {
    return this.storeItemRepository.findOneByIdAndStatus(id, 'ACTIVE');
  }
}
