import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderDomain } from '../entities/order.domain';
import Decimal from 'decimal.js';
import { CreateOrderDto } from '../dtos/create.order.dto';
import { OrdersRepository } from '../repositories/orders.repository';
import { RecipientsService } from '../../recipients/services/recipients.service';
import { StoreItemWithFlatPriceDomain } from '../../store/entities/store.item.domain';
import { StoreService } from '../../store/services/store.service';
import { UserDomain } from '../../users/domain/user.domain';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly recipientsService: RecipientsService,
    private readonly storeService: StoreService,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  public async findAllByUserId(userId: string): Promise<OrderDomain[]> {
    return this.ordersRepository.findAllByUserId(userId);
  }

  public async createOneOrder(
    user: UserDomain,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDomain> {
    if (user.balance <= 0) {
      throw new BadRequestException('Not enough balance');
    }

    const recipient = await this.recipientsService.findOneByIdAndUserId(
      createOrderDto.recipientId,
      user.id,
    );

    if (!recipient) {
      throw new NotFoundException(`This recipient does not exist`);
    }

    if (!recipient.isVerified()) {
      throw new BadRequestException(`This recipient is not verified`);
    }

    const items = await this.storeService.findAllStoreItemsByOfferId(
      createOrderDto.offerIds,
    );

    if (items.length !== createOrderDto.offerIds.length) {
      throw new BadRequestException(`You have invalid items`);
    }

    const itemsWithFlatPrices: StoreItemWithFlatPriceDomain[] = items.map(
      (item) => ({
        ...item,
        flatPrice: this.storeService.getFlatItemPriceByRegion(
          item.price,
          item.currency,
          recipient.region,
        ),
      }),
    );

    let totalOrderPrice = new Decimal(0);
    for (const item of itemsWithFlatPrices) {
      totalOrderPrice = totalOrderPrice.plus(item.flatPrice);
    }

    if (totalOrderPrice.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Invalid order price');
    }

    if (!user.hasSufficientBalance(totalOrderPrice)) {
      throw new BadRequestException('You do not have enough balance');
    }

    const updatedUser =
      await this.usersService.decrementOneBalanceByIdAndCurrentBalance(
        user.id,
        totalOrderPrice.toNumber(),
        user.balance,
      );

    if (!updatedUser) {
      throw new BadRequestException('Not enough balance');
    }

    const order = new OrderDomain({
      price: totalOrderPrice.toNumber(),
      status: 'PENDING',
      recipientId: recipient.id,
      userId: user.id,
    });

    return await this.ordersRepository.createOneWithTransactions(
      order,
      itemsWithFlatPrices,
    );
  }
}
