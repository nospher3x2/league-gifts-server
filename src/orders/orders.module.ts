import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { DatabaseModule } from '@common';
import { UsersModule } from 'src/users/users.module';
import { RecipientsModule } from 'src/recipients/recipients.module';
import { StoreModule } from 'src/store/store.module';
import { OrdersRepository } from './repositories/orders.repository';
import { PrismaOrdersRepository } from './repositories/implementations/prisma.orders.repository';

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
