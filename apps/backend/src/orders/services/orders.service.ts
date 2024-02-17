import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { OrdersRepository } from '../repositories/orders.repository';
import { StoreService } from '../../store/services/store.service';
import { UsersService } from '../../users/services/users.service';
import {
  OrderDomain,
  OrderStatus,
  OrderTransactionDomain,
  OrderTransactionStatus,
  OrderTransactionWithItemAndSenderDomain,
  OrderWithRecipientAndTransactionsDomain,
} from '@common/orders';
import { UserDomain } from '@common/users';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { AccountsService } from '../../accounts/services/accounts.service';
import { SendGiftDto } from '@common/sender';
import { OrdersTransactionRepository } from '../repositories/orders.transactions.repository';
import { RecipientDomain } from '@common/recipients';
import { StoreItemWithFlatPriceDomain } from '@common/store';
import { LeagueAccountDomain } from '@common/accounts';

@Injectable()
export class OrdersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly storeService: StoreService,
    private readonly ordersRepository: OrdersRepository,
    private readonly ordersTransactionsRepository: OrdersTransactionRepository,
    @Inject('ORDERS_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  public async findAllByUserId(userId: string): Promise<OrderDomain[]> {
    return this.ordersRepository.findAllByUserId(userId);
  }

  public async createOne(
    user: UserDomain,
    recipient: RecipientDomain,
    offerIds: string[],
  ): Promise<OrderDomain> {
    const items = await this.storeService.findAllStoreItemsByOfferId(offerIds);
    if (items.length !== offerIds.length) {
      throw new BadRequestException(`One or more items do not exist.`);
    }

    const itemsWithFlatPrice =
      this.storeService.transformStoreItemsInStoreItemsWithFlatPrice(
        items,
        recipient.region,
      );

    const { totalOrderPrice, cheapestItem } =
      this.getTotalOrderPriceAndCheapestItem(itemsWithFlatPrice);

    const accounts =
      await this.accountsService.findAllGiftAccountsWithMinimumRpByRegion(
        recipient.region,
        cheapestItem.price,
      );

    if (accounts.length < itemsWithFlatPrice.length) {
      throw new InternalServerErrorException(
        'There are not enough accounts to send the gifts. Please reduce the number of items in your order.',
      );
    }

    const order = new OrderWithRecipientAndTransactionsDomain({
      id: randomUUID(),
      price: totalOrderPrice.toNumber(),
      status: OrderStatus.PENDING,
      transactions: [],
      recipient: recipient,
      recipientId: recipient.id,
      userId: user.id,
    });

    for (const item of itemsWithFlatPrice) {
      const bestSender = this.getLeastExpensiveAccountForOneItem(
        accounts,
        item,
      );

      order.transactions.push(
        new OrderTransactionWithItemAndSenderDomain({
          id: randomUUID(),
          status: OrderTransactionStatus.PENDING,
          price: item.flatPrice,
          item: item,
          orderId: order.id,
          sender: bestSender,
          senderId: bestSender.id,
        }),
      );
    }

    const { transaction, user: updatedUser } =
      await this.usersService.createTransactionToDecrementBalanceByIdAndCurrentBalance(
        user.id,
        totalOrderPrice.toNumber(),
        user.balance,
      );

    if (!updatedUser) {
      throw new BadRequestException(
        'You do not have enough balance to create this order.',
      );
    }

    try {
      const createdOrder =
        await this.ordersRepository.createOneWithTransactions(
          transaction,
          order,
        );

      for (const transaction of createdOrder.transactions) {
        console.log(transaction);

        this.kafkaClient.emit<any, SendGiftDto>('gift.send', {
          orderId: order.id,
          recipient: order.recipient,
          transaction: transaction,
        });
      }

      await transaction.$commit();
      return createdOrder;
    } catch (error) {
      await transaction.$rollback();
      throw error;
    }
  }

  public async updateOrderStatus(
    orderId: string,
    status: keyof typeof OrderStatus,
  ): Promise<OrderDomain | null> {
    const order = await this.ordersRepository.findOneById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === status) {
      return order;
    }

    order.status = status;
    return await this.ordersRepository.updateOne(order);
  }

  public async updateTransactionStatus(
    transactionId: string,
    status: keyof typeof OrderTransactionStatus,
  ): Promise<OrderTransactionDomain | null> {
    const transaction =
      await this.ordersTransactionsRepository.findOneById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Order not found');
    }
    if (transaction.status === status) {
      return transaction;
    }

    transaction.status = status;
    return await this.ordersTransactionsRepository.updateOne(transaction);
  }

  private getTotalOrderPriceAndCheapestItem(
    items: StoreItemWithFlatPriceDomain[],
  ): { totalOrderPrice: Decimal; cheapestItem: StoreItemWithFlatPriceDomain } {
    let totalOrderPrice = new Decimal(0);
    let cheapestItem = items[0];
    for (const item of items) {
      totalOrderPrice = totalOrderPrice.plus(item.flatPrice);
      if (item.price < cheapestItem.price) {
        cheapestItem = item;
      }
    }

    if (totalOrderPrice.lessThanOrEqualTo(0)) {
      throw new BadRequestException('The order price must be greater than 0.');
    }

    return { totalOrderPrice, cheapestItem };
  }

  private getLeastExpensiveAccountForOneItem(
    accounts: LeagueAccountDomain[],
    item: StoreItemWithFlatPriceDomain,
  ): LeagueAccountDomain {
    if (accounts.length === 1) {
      return accounts[0];
    }

    let bestSender = accounts[0];
    let bestSenderIndex = 0;
    for (let i = 0; i < accounts.length; i++) {
      const sender = accounts[i];
      if (sender.rp >= item.price && sender.rp < bestSender.rp) {
        bestSender = sender;
        bestSenderIndex = i;
      }
    }

    accounts.splice(bestSenderIndex, 1);
    return bestSender;
  }
}
