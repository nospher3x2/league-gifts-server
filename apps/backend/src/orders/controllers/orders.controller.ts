import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from '../dtos/create.order.dto';
import {
  OrderDomain,
  OrderWithRecipientAndTransactionsDomain,
} from '../entities/order.domain';
import { OrdersService } from '../services/orders.service';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { User } from '../../users/decorators/user.decorator';
import { UserDomain } from '../../users/domain/user.domain';

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

  @Post()
  public async createOne(
    @User() user: UserDomain,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderDomain> {
    const order = await this.ordersService.createOneOrder(user, createOrderDto);
    return plainToInstance(OrderWithRecipientAndTransactionsDomain, order);
  }
}
