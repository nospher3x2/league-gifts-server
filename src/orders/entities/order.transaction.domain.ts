import { StoreItemDomain } from 'src/store/entities/store.item.domain';
import { OrderTransactionStatus } from '../enums/order.transaction.status.enum';

export class OrderTransactionDomain {
  public id: string;
  public price: number;
  public status: keyof typeof OrderTransactionStatus;
  public orderId: string;
  public itemId: string;
  public senderAccountId: string;
  public createdAt: Date;
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
