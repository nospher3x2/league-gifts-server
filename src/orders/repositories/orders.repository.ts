import { StoreItemWithFlatPriceDomain } from 'src/store/entities/store.item.domain';
import {
  OrderDomain,
  OrderWithRecipientAndTransactionsDomain,
} from '../entities/order.domain';

export abstract class OrdersRepository {
  public abstract findAllByUserId(userId: string): Promise<OrderDomain[]>;

  public abstract findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<OrderDomain | undefined>;

  public abstract createOneWithTransactions(
    order: OrderDomain,
    items: StoreItemWithFlatPriceDomain[],
  ): Promise<OrderWithRecipientAndTransactionsDomain>;
}
