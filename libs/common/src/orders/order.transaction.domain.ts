import { Exclude } from 'class-transformer';
import { OrderTransactionStatus } from './order.transaction.status.enum';
import { StoreItemDomain } from '@common/store';
import { LeagueAccountDomain } from '@common/accounts';

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

export class OrderTransactionWithItemAndSenderDomain extends OrderTransactionDomain {
  public item: StoreItemDomain;
  public sender: LeagueAccountDomain;

  constructor(partial: Partial<OrderTransactionWithItemAndSenderDomain>) {
    super(partial);
    Object.assign(this, partial);
  }
}
