import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../orders.repository';
import { PrismaService } from '@common';
import {
  OrderDomain,
  OrderWithTransactionsDomain,
} from 'src/orders/entities/order.domain';
import { StoreItemWithFlatPriceDomain } from 'src/store/entities/store.item.domain';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';

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
    order: OrderWithTransactionsDomain,
    items: StoreItemWithFlatPriceDomain[],
  ): Promise<OrderDomain> {
    const orderId = randomUUID();
    const createManyOrderTransactionPayload: Prisma.OrderTransactionCreateManyInput[] =
      [];
    const createManyOrderTransactionItemPayload: Prisma.OrderTransactionItemCreateManyInput[] =
      [];

    for (const item of items) {
      const transactionItemId = randomUUID();
      createManyOrderTransactionItemPayload.push({
        id: transactionItemId,
        inventoryType: item.inventoryType,
        subInventoryType: item.subInventoryType,
        price: item.price,
        currency: item.currency,
        name: item.name,
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

    const transactions = await this.prisma.$transaction([
      this.prisma.order.create({
        data: {
          id: orderId,
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
      }),
      this.prisma.orderTransactionItem.createMany({
        data: createManyOrderTransactionItemPayload,
      }),
      this.prisma.orderTransaction.createMany({
        data: createManyOrderTransactionPayload,
      }),
    ]);

    return transactions[0];
  }
}
