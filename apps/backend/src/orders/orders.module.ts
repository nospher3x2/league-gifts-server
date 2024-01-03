import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { DatabaseModule } from '@common';
import { OrdersRepository } from './repositories/orders.repository';
import { PrismaOrdersRepository } from './repositories/implementations/prisma.orders.repository';
import { RecipientsModule } from '../recipients/recipients.module';
import { StoreModule } from '../store/store.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule, RecipientsModule, StoreModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: OrdersRepository,
      useClass: PrismaOrdersRepository,
    },
  ],
})
export class OrdersModule {}
