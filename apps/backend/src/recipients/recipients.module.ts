import { Module } from '@nestjs/common';
import { RecipientsController } from './controller/recipients.controller';
import { RecipientsService } from './services/recipients.service';
import { DatabaseModule } from '@common';
import { RecipientsRepository } from './repositories/recipients.repository';
import { PrismaRecipientsRepository } from './repositories/implementations/prisma.recipients.repository';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [DatabaseModule, AccountsModule],
  providers: [
    RecipientsService,
    {
      provide: RecipientsRepository,
      useClass: PrismaRecipientsRepository,
    },
  ],
  controllers: [RecipientsController],
  exports: [RecipientsService],
})
export class RecipientsModule {}
