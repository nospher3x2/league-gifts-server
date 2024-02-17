import { PrismaService } from '@common';
import { Injectable } from '@nestjs/common';
import { OrdersTransactionRepository } from '../orders.transactions.repository';
import { OrderTransactionDomain } from '@common/orders';

@Injectable()
export class PrismaOrdersTransactionsRepository
  implements OrdersTransactionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  public async findOneById(id: string): Promise<OrderTransactionDomain> {
    return this.prisma.orderTransaction.findUnique({
      where: {
        id,
      },
    });
  }

  public async updateOne(
    order: OrderTransactionDomain,
  ): Promise<OrderTransactionDomain> {
    return this.prisma.orderTransaction.update({
      where: {
        id: order.id,
      },
      data: {
        status: order.status,
      },
    });
  }
}
