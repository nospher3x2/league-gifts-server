import { LeagueAccountDomain } from '@common/accounts';
import { OrderStatus, OrderTransactionStatus } from '@common/orders';
import { SendGiftDto } from '@common/sender';
import { Ezreal } from '@ezreal';
import { CapOrder } from '@ezreal/interfaces/cap.order.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class SenderService {
  constructor(
    @Inject('SENDER_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  public async send(sendGiftDto: SendGiftDto): Promise<string> {
    this.updateOrderStatus(sendGiftDto.orderId, OrderStatus.PROCESSING);

    const createdOrder = await this.createCapOrder(sendGiftDto);
    const createdOrderStatus = this.getCapOrderStatus(createdOrder);
    this.updateTransactionStatus(
      sendGiftDto.transaction.id,
      createdOrderStatus,
    );

    const status = await this.waitNewOrderStatus(
      sendGiftDto.transaction.sender,
      createdOrder.id,
      createdOrderStatus,
    );
    this.updateOrderStatus(sendGiftDto.transaction.id, status);

    return;
  }

  private getCapOrderStatus(order: CapOrder): string {
    return order.subOrders.length === 1
      ? order.subOrders[0].status
      : order.status.status;
  }

  private createCapOrder(sendGiftDto: SendGiftDto): Promise<CapOrder> {
    return Ezreal.createCapOrder(
      sendGiftDto.transaction.sender,
      sendGiftDto.transaction.item.offerId,
      sendGiftDto.transaction.item.currency,
      sendGiftDto.transaction.sender.name,
      sendGiftDto.recipient.puuid,
      sendGiftDto.recipient.name,
      'Isso é um teste',
      sendGiftDto.transaction.id,
    );
  }

  private waitNewOrderStatus(
    sender: LeagueAccountDomain,
    orderId: string,
    currentStatus: string,
  ): Promise<string> {
    const start = Date.now();
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const order = await Ezreal.getCapOrderByOrderId(sender, orderId);
        const status = this.getCapOrderStatus(order);
        if (status !== currentStatus) {
          clearInterval(interval);
          resolve(status);
        }

        // 30 seconds timeout
        if (Date.now() - start > 30 * 1000) {
          clearInterval(interval);
          resolve(OrderTransactionStatus.FAILED);
        }
      }, 1000);
    });
  }

  private updateOrderStatus(orderId: string, status: string) {
    return this.kafkaClient.emit('order.status.update', {
      id: orderId,
      status: status,
    });
  }

  private updateTransactionStatus(transactionId: string, status: string) {
    return this.kafkaClient.emit('transaction.status.update', {
      id: transactionId,
      status: status,
    });
  }
}
