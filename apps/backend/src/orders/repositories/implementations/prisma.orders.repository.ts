import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../orders.repository';
import { PrismaService } from '@common';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaRecipientsMapper } from 'apps/backend/src/recipients/repositories/mappers/prisma.recipients.mapper';
import { OrderTransactionWithItemDomain } from '../../entities/order.transaction.domain';
import {
  OrderDomain,
  OrderWithRecipientAndTransactionsDomain,
} from '../../entities/order.domain';
import {
  StoreItemWithFlatPriceDomain,
  StoreItemDomain,
} from '../../../store/entities/store.item.domain';

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

  public findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<OrderDomain> {
    return this.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  public async createOneWithTransactions(
    order: OrderDomain,
    items: StoreItemWithFlatPriceDomain[],
  ): Promise<OrderWithRecipientAndTransactionsDomain> {
    const orderId = randomUUID();
    const createManyOrderTransactionPayload: Prisma.OrderTransactionCreateManyInput[] =
      [];
    const createManyOrderTransactionItemPayload: Prisma.OrderTransactionItemCreateManyInput[] =
      [];

    for (const item of items) {
      const transactionItemId = randomUUID();
      createManyOrderTransactionItemPayload.push({
        id: transactionItemId,
        name: item.name,
        iconUrl: item.iconUrl,
        currency: item.currency,
        price: item.price,
        inventoryType: item.inventoryType,
        subInventoryType: item.subInventoryType,
        offerId: item.offerId,
      });

      createManyOrderTransactionPayload.push({
        id: randomUUID(),
        status: 'PENDING',
        price: item.flatPrice,
        itemId: transactionItemId,
        orderId,
      });
    }

    const transaction = await this.prisma.$transaction([
      this.prisma.order.create({
        data: {
          id: orderId,
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
      this.prisma.orderTransactionItem.createMany({
        data: createManyOrderTransactionItemPayload,
      }),
      this.prisma.orderTransaction.createMany({
        data: createManyOrderTransactionPayload,
      }),
      this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          recipient: true,
          transactions: {
            include: {
              item: true,
            },
          },
        },
      }),
    ]);

    const createdOrder = transaction[3];
    return new OrderWithRecipientAndTransactionsDomain({
      ...createdOrder,
      recipient: PrismaRecipientsMapper.toDomain(createdOrder.recipient),
      transactions: createdOrder.transactions.map(
        (transaction) =>
          new OrderTransactionWithItemDomain({
            ...transaction,
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
}
