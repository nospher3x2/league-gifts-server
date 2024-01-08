import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@common';
import { AccountsService } from './services/accounts.service';
import { LeagueAccountsRepository } from './repositories/league.accounts.repository';
import { PrismaLeagueAccountsRepository } from './repositories/implementations/prisma.league.account.repository';
import { AccountsController } from './controller/accounts.controller';

@Module({
  imports: [ConfigModule, DatabaseModule],
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
