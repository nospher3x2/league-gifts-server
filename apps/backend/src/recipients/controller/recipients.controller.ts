import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RecipientsService } from '../services/recipients.service';
import { plainToInstance } from 'class-transformer';
import { CreateRecipientDto } from '../dtos/create.recipient.dto';
import { CustomResponse } from '@common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { User } from '../../users/decorators/user.decorator';
import { RecipientDomain } from '@common/recipients';
import { UserDomain } from '@common/users';
import { RecipientExistsPipe } from '../pipes/recipient.exists.pipe';

@Controller('recipients')
@UseGuards(JwtAuthGuard)
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
    @Param('id', RecipientExistsPipe()) recipient: RecipientDomain,
  ): Promise<RecipientDomain | null> {
    return plainToInstance(RecipientDomain, recipient);
  }

  @Get(':id/verify')
  public async verifyOneByIdAndUserId(
    @Param('id', RecipientExistsPipe('PENDING')) recipient: RecipientDomain,
  ): Promise<RecipientDomain> {
    return plainToInstance(
      RecipientDomain,
      await this.recipientsService.updateOneIfChangedProfileIconToRequired(
        recipient,
      ),
    );
  }

  @Post()
  public async createOne(
    @Body() createRecipientDto: CreateRecipientDto,
    @User() user: UserDomain,
  ): Promise<RecipientDomain> {
    const recipient = await this.recipientsService.createOne(
      createRecipientDto,
      user.id,
    );

    return plainToInstance(RecipientDomain, recipient);
  }

  @Delete(':id')
  public async deleteOne(
    @Param('id', RecipientExistsPipe()) recipient: RecipientDomain,
  ): Promise<CustomResponse<void>> {
    await this.recipientsService.deleteOne(recipient);
    return {
      message: 'Recipient deleted successfully',
      data: null,
    };
  }
}
