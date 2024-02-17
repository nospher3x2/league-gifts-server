import { OrderTransactionDomain } from '@common/orders';

export abstract class OrdersTransactionRepository {
  public abstract findOneById(
    id: string,
  ): Promise<OrderTransactionDomain | undefined>;

  public abstract updateOne(
    order: OrderTransactionDomain,
  ): Promise<OrderTransactionDomain>;
}
