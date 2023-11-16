import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '@common';
import { AccountsServiceConfig } from './config/account.service.config';
import { AccountsService } from './services/accounts.service';
import { LeagueAccountsRepository } from './repositories/league.accounts.repository';
import { PrismaLeagueAccountsRepository } from './repositories/implementations/prisma.league.account.repository';
import { AuthProvider } from './providers/auth.provider';
import { HydraAuthProvider } from './providers/implementations/hydra.auth.provider';

@Module({
  imports: [ConfigModule, HttpModule, DatabaseModule],
  providers: [
    AccountsServiceConfig,
    AccountsService,
    HydraAuthProvider,
    {
      provide: LeagueAccountsRepository,
      useClass: PrismaLeagueAccountsRepository,
    },
    {
      provide: AuthProvider,
      useClass: HydraAuthProvider,
    },
  ],
  exports: [AccountsServiceConfig, AccountsService],
})
export class AccountsModule {}
