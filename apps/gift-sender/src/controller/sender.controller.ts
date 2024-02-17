import { Controller } from '@nestjs/common';
import { SenderService } from '../services/sender.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SendGiftDto } from '@common/sender';

@Controller('gift-sender')
export class SenderController {
  constructor(private readonly senderService: SenderService) {}

  @MessagePattern('send')
  public async send(@Payload() order: SendGiftDto): Promise<string> {
    return this.senderService.send(order);
  }
}
