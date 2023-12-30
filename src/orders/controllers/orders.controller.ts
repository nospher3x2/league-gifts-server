import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from '../dtos/create.order.dto';
import { OrderDomain } from '../entities/order.domain';
import { OrdersService } from '../services/orders.service';
import { User } from 'src/users/decorators/user.decorator';
import { UserDomain } from 'src/users/domain/user.domain';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

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
    return this.ordersService.createOneOrder(user, createOrderDto);
  }
}
