import { Module } from '@nestjs/common';
import { SenderService } from './services/sender.service';
import { SenderController } from './controller/sender.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SENDER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'sender',
            brokers: ['kafka:29092'],
          },
        },
      },
    ]),
  ],
  controllers: [SenderController],
  providers: [SenderService],
})
export class GiftSenderModule {}
