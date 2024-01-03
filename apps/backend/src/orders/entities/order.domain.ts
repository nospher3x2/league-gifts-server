import { RecipientDomain } from '../../recipients/entities/recipient.domain';
import { OrderStatus } from '../enums/order.status.enum';
import { OrderTransactionWithItemDomain } from './order.transaction.domain';
import { Exclude } from 'class-transformer';

export class OrderDomain {
  public id: string;
  public price: number;
  public status: keyof typeof OrderStatus;

  @Exclude()
  public recipientId: string;
  @Exclude()
  public userId: string;
  @Exclude()
  public createdAt: Date;
  @Exclude()
  public updatedAt: Date;

  constructor(partial: Partial<OrderDomain>) {
    Object.assign(this, partial);
  }
}

export class OrderWithRecipientAndTransactionsDomain extends OrderDomain {
  public recipient: RecipientDomain;
  public transactions: OrderTransactionWithItemDomain[];

  constructor(partial: Partial<OrderWithRecipientAndTransactionsDomain>) {
    super(partial);
    Object.assign(this, partial);
  }
}
