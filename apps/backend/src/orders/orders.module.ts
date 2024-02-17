import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { DatabaseModule } from '@common';
import { OrdersRepository } from './repositories/orders.repository';
import { PrismaOrdersRepository } from './repositories/implementations/prisma.orders.repository';
import { RecipientsModule } from '../recipients/recipients.module';
import { StoreModule } from '../store/store.module';
import { UsersModule } from '../users/users.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountsModule } from '../accounts/accounts.module';
import { OrdersTransactionRepository } from './repositories/orders.transactions.repository';
import { PrismaOrdersTransactionsRepository } from './repositories/implementations/prisma.orders.transactions.repository';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'orders',
            brokers: ['kafka:29092'],
          },
        },
      },
    ]),
    UsersModule,
    AccountsModule,
    RecipientsModule,
    StoreModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: OrdersRepository,
      useClass: PrismaOrdersRepository,
    },
    {
      provide: OrdersTransactionRepository,
      useClass: PrismaOrdersTransactionsRepository,
    },
  ],
})
export class OrdersModule {}
