import { Module } from '@nestjs/common';
import { RecipientsController } from './controller/recipients.controller';
import { RecipientsService } from './services/recipients.service';
import { DatabaseModule } from '@common';
import { AccountsModule } from 'src/accounts/accounts.module';
import { RecipientsRepository } from './repositories/recipients.repository';
import { PrismaRecipientsRepository } from './repositories/implementations/prisma.recipients.repository';

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
})
export class RecipientsModule {}
