import { Controller, Get, Param } from '@nestjs/common';
import { RecipientsService } from '../services/recipients.service';
import { User } from 'src/users/decorators/user.decorator';
import { UserDomain } from 'src/users/domain/user.domain';
import { RecipientDomain } from '../entities/recipient.domain';
import { plainToInstance } from 'class-transformer';

@Controller('recipients')
export class RecipientsController {
  constructor(private readonly recipientsService: RecipientsService) {}

  @Get()
  public async findAllByUserId(
    @User() user: UserDomain,
  ): Promise<RecipientDomain[]> {
    const recipients = await this.recipientsService.findAllByUserId(user.id);
    return recipients.map((recipient) =>
      plainToInstance(RecipientDomain, recipient),
    );
  }

  @Get(':id')
  public async findOneByIdAndUserId(
    @Param('id') id: string,
    @User() user: UserDomain,
  ): Promise<RecipientDomain | null> {
    const recipient = await this.recipientsService.findOneByIdAndUserId(
      id,
      user.id,
    );

    if (!recipient) {
      return null;
    }

    return plainToInstance(RecipientDomain, recipient);
  }

  @Get(':id/verify')
  public async verifyOneByIdAndUserId(
    @Param('id') id: string,
    @User() user: UserDomain,
  ): Promise<RecipientDomain> {
    const recipient =
      await this.recipientsService.updateOneIfChangedProfileIconToRequired(
        id,
        user.id,
      );

    return plainToInstance(RecipientDomain, recipient);
  }
}
