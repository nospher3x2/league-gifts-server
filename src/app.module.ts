import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

import { DatabaseModule } from '@common';
import enviromentConfig from '@common/config/environment';
import enviromentConfigValidation from '@common/config/environment/validation';

import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResponseTransformInterceptor } from '@common/interceptors/response-transform.interceptor';
import { AccountsModule } from './accounts/accounts.module';
import { StoreModule } from './store/store.module';
import { RecipientsModule } from './recipients/recipients.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (request, response) => {
          const existingId = request.id ?? request.headers['x-request-id'];
          if (existingId) return existingId;

          const id = randomUUID();
          response.setHeader('X-Request-Id', id);
          return id;
        },
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    ConfigModule.forRoot({
      cache: true,
      load: [enviromentConfig],
      validationSchema: enviromentConfigValidation,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
      expandVariables: true,
      // envFilePath:
      //   process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        url: config.getOrThrow<string>('database.redis.url'),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    AccountsModule,
    StoreModule,
    RecipientsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_PIPE,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
