import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../orders.repository';
import { FlatTransactionClient, PrismaService } from '@common';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaRecipientsMapper } from 'apps/backend/src/recipients/repositories/mappers/prisma.recipients.mapper';
import {
  OrderDomain,
  OrderTransactionWithItemAndSenderDomain,
  OrderWithRecipientAndTransactionsDomain,
} from '@common/orders';
import { StoreItemDomain } from '@common/store';
import { PrismaLeagueAccountsMapper } from 'apps/backend/src/accounts/repositories/mappers/prisma.league.accounts.mapper';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  public findAllByUserId(userId: string): Promise<OrderDomain[]> {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
    });
  }

  public findOneById(id: string): Promise<OrderDomain> {
    return this.prisma.order.findUnique({
      where: {
        id,
      },
    });
  }

  public findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<OrderDomain> {
    return this.prisma.order.findUnique({
      where: {
        id,
        userId,
      },
    });
  }

  public async createOneWithTransactions(
    transactionClient: FlatTransactionClient,
    order: OrderWithRecipientAndTransactionsDomain,
  ): Promise<OrderWithRecipientAndTransactionsDomain> {
    const createManyOrderTransactionPayload: Prisma.OrderTransactionCreateManyInput[] =
      [];
    const createManyOrderTransactionItemPayload: Prisma.OrderTransactionItemCreateManyInput[] =
      [];

    for (const transaction of order.transactions) {
      const transactionItemId = randomUUID();
      createManyOrderTransactionItemPayload.push({
        id: transactionItemId,
        name: transaction.item.name,
        iconUrl: transaction.item.iconUrl,
        currency: transaction.item.currency,
        price: transaction.item.price,
        inventoryType: transaction.item.inventoryType,
        subInventoryType: transaction.item.subInventoryType,
        offerId: transaction.item.offerId,
      });

      createManyOrderTransactionPayload.push({
        id: transaction.id,
        price: transaction.price,
        status: transaction.status,
        senderId: transaction.senderId,
        itemId: transactionItemId,
        orderId: order.id,
      });
    }

    const transactions = await Promise.all([
      transactionClient.order.create({
        data: {
          id: order.id,
          price: order.price,
          status: order.status,
          user: {
            connect: {
              id: order.userId,
            },
          },
          recipient: {
            connect: {
              id: order.recipientId,
            },
          },
        },
        include: {
          recipient: true,
        },
      }),
      transactionClient.orderTransactionItem.createMany({
        data: createManyOrderTransactionItemPayload,
      }),
      transactionClient.orderTransaction.createMany({
        data: createManyOrderTransactionPayload,
      }),
      transactionClient.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          recipient: true,
          transactions: {
            include: {
              sender: true,
              item: true,
            },
          },
        },
      }),
    ]);

    const createdOrder = transactions[3];
    return new OrderWithRecipientAndTransactionsDomain({
      ...createdOrder,
      recipient: PrismaRecipientsMapper.toDomain(createdOrder.recipient),
      transactions: createdOrder.transactions.map(
        (transaction) =>
          new OrderTransactionWithItemAndSenderDomain({
            ...transaction,
            sender: PrismaLeagueAccountsMapper.toDomain(transaction.sender),
            item: new StoreItemDomain({
              name: transaction.item.name,
              iconUrl: transaction.item.iconUrl,
              price: transaction.item.price,
              currency: transaction.item.currency,
              inventoryType: transaction.item.inventoryType,
              subInventoryType: transaction.item.subInventoryType,
              offerId: transaction.item.offerId,
            }),
          }),
      ),
    });
  }

  public updateOne(order: OrderDomain): Promise<OrderDomain> {
    return this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: order.status,
      },
    });
  }
}
