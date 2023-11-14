import { Module } from '@nestjs/common';
import { StoreController } from './controllers/store.controller';
import { StoreService } from './services/store.service';
import { DatabaseModule } from '@common';
import { StoreItemRepository } from './repositories/store.item.repository';
import { PrismaStoreItemRepository } from './repositories/implementations/prisma.store.item.repository';
import { ConfigModule } from '@nestjs/config';
import { StoreItemPriceConfig } from './config/store.item.price.config';

@Module({
  imports: [DatabaseModule, ConfigModule],
  providers: [
    StoreItemPriceConfig,
    StoreService,
    {
      provide: StoreItemRepository,
      useClass: PrismaStoreItemRepository,
    },
  ],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}
