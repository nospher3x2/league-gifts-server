import { Module } from '@nestjs/common';
import { AccountsService } from './services/accounts.service';

@Module({
  providers: [AccountsService],
})
export class AccountsModule {}
