import { RecipientDomain } from 'src/recipients/entities/recipient.domain';
import { OrderStatus } from '../enums/order.status.enum';
import { OrderTransactionDomain } from './order.transaction.domain';

export class OrderDomain {
  public id: string;
  public status: keyof typeof OrderStatus;
  public recipientId: string;
  public userId: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(partial: Partial<OrderDomain>) {
    Object.assign(this, partial);
  }
}

export class OrderWithRecipientDomain extends OrderDomain {
  public recipient: RecipientDomain;

  constructor(partial: Partial<OrderWithRecipientDomain>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class OrderWithTransactionsDomain extends OrderDomain {
  public transactions: OrderTransactionDomain[];

  constructor(partial: Partial<OrderWithTransactionsDomain>) {
    super(partial);
    Object.assign(this, partial);
  }
}
