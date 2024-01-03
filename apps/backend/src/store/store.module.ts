import { Module } from '@nestjs/common';
import { StoreController } from './controllers/store.controller';
import { StoreService } from './services/store.service';
import { DatabaseModule } from '@common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StoreItemPriceConfig } from './config/store.item.price.config';
import { StoreItemCache } from './cache/store.item.cache';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        url: config.getOrThrow<string>('database.redis.url'),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AccountsModule,
  ],
  providers: [StoreItemPriceConfig, StoreItemCache, StoreService],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}
