import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '@common';
import { AccountsService } from './services/accounts.service';
import { LeagueAccountsRepository } from './repositories/league.accounts.repository';
import { PrismaLeagueAccountsRepository } from './repositories/implementations/prisma.league.account.repository';
import { AccountsController } from './controller/accounts.controller';

@Module({
  imports: [ConfigModule, HttpModule, DatabaseModule],
  controllers: [AccountsController],
  providers: [
    AccountsService,
    {
      provide: LeagueAccountsRepository,
      useClass: PrismaLeagueAccountsRepository,
    },
  ],
  exports: [AccountsService],
})
export class AccountsModule {}
