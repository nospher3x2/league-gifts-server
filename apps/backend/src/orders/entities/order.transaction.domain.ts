import { StoreItemDomain } from '../../store/entities/store.item.domain';
import { OrderTransactionStatus } from '../enums/order.transaction.status.enum';
import { Exclude } from 'class-transformer';

export class OrderTransactionDomain {
  public id: string;
  public price: number;
  public status: keyof typeof OrderTransactionStatus;
  @Exclude()
  public orderId: string;
  @Exclude()
  public itemId: string;
  @Exclude()
  public senderId: string;
  @Exclude()
  public createdAt: Date;
  @Exclude()
  public updatedAt: Date;

  constructor(partial: Partial<OrderTransactionDomain>) {
    Object.assign(this, partial);
  }
}

export class OrderTransactionWithItemDomain extends OrderTransactionDomain {
  public item: StoreItemDomain;

  constructor(partial: Partial<OrderTransactionWithItemDomain>) {
    super(partial);
    Object.assign(this, partial);
  }
}
