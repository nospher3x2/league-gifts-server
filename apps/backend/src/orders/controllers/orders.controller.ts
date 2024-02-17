import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from '../dtos/create.order.dto';

import { OrdersService } from '../services/orders.service';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { User } from '../../users/decorators/user.decorator';
import {
  OrderDomain,
  OrderStatus,
  OrderTransactionDomain,
  OrderTransactionStatus,
  OrderWithRecipientAndTransactionsDomain,
} from '@common/orders';
import { UserDomain } from '@common/users';
import { MessagePattern } from '@nestjs/microservices';
import { RecipientExistsPipe } from '../../recipients/pipes/recipient.exists.pipe';
import { RecipientDomain } from '@common/recipients';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  public async findAllByUserId(
    @User() user: UserDomain,
  ): Promise<OrderDomain[]> {
    return this.ordersService.findAllByUserId(user.id);
  }

  @Post(':recipientId')
  public async createOne(
    @User() user: UserDomain,
    @Param('recipientId', RecipientExistsPipe('VERIFIED'))
    recipient: RecipientDomain,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderDomain> {
    const order = await this.ordersService.createOne(
      user,
      recipient,
      createOrderDto.offerIds,
    );
    return plainToInstance(OrderWithRecipientAndTransactionsDomain, order);
  }

  @MessagePattern('order.status.update')
  public async updateOrderStatus(
    orderId: string,
    status: keyof typeof OrderStatus,
  ): Promise<OrderDomain | null> {
    return this.ordersService.updateOrderStatus(orderId, status);
  }

  @MessagePattern('transaction.status.update')
  public async updateTransactionStatus(
    transactionId: string,
    status: keyof typeof OrderTransactionStatus,
  ): Promise<OrderTransactionDomain | null> {
    return this.ordersService.updateTransactionStatus(transactionId, status);
  }
}
