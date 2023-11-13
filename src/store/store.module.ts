import { Module } from '@nestjs/common';
import { StoreController } from './controllers/store.controller';
import { StoreService } from './services/store.service';
import { DatabaseModule } from '@common';
import { StoreItemRepository } from './repositories/store.item.repository';
import { PrismaStoreItemRepository } from './repositories/prisma/prisma.store.item.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    StoreService,
    {
      provide: StoreItemRepository,
      useClass: PrismaStoreItemRepository,
    },
  ],
  controllers: [StoreController],
})
export class StoreModule {}
