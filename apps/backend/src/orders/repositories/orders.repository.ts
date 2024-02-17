import { FlatTransactionClient } from '@common';
import {
  OrderDomain,
  OrderWithRecipientAndTransactionsDomain,
} from '@common/orders';

export abstract class OrdersRepository {
  public abstract findAllByUserId(userId: string): Promise<OrderDomain[]>;

  public abstract findOneById(id: string): Promise<OrderDomain | undefined>;
  public abstract findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<OrderDomain | undefined>;

  public abstract createOneWithTransactions(
    transactionClient: FlatTransactionClient,
    order: OrderWithRecipientAndTransactionsDomain,
  ): Promise<OrderWithRecipientAndTransactionsDomain>;

  public abstract updateOne(order: OrderDomain): Promise<OrderDomain>;
}
