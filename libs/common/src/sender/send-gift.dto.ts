import { OrderTransactionWithItemAndSenderDomain } from '@common/orders';
import { RecipientDomain } from '@common/recipients';

export class SendGiftDto {
  public orderId: string;
  public recipient: RecipientDomain;
  public transaction: OrderTransactionWithItemAndSenderDomain;
}
