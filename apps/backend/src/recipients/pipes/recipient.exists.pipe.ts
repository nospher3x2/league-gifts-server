import { RecipientDomain, RecipientStatus } from '@common/recipients';
import {
  BadRequestException,
  Inject,
  NotFoundException,
  PipeTransform,
  Type,
  UnauthorizedException,
  forwardRef,
  mixin,
} from '@nestjs/common';
import { RecipientsService } from '../services/recipients.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserDomain } from '@common/users';

export function RecipientExistsPipe(
  statusRequired: keyof typeof RecipientStatus | null = null,
): Type<PipeTransform> {
  class MixinRecipientExistsPipe
    implements PipeTransform<string, Promise<RecipientDomain>>
  {
    constructor(
      @Inject(REQUEST)
      private readonly request: Request,
      @Inject(forwardRef(() => RecipientsService))
      private readonly recipientsService: RecipientsService,
    ) {}

    public async transform(recipientId: string): Promise<RecipientDomain> {
      const user = this.request.user as UserDomain;
      if (!user) {
        throw new UnauthorizedException();
      }

      const recipient = await this.recipientsService.findOneByIdAndUserId(
        recipientId,
        user.id,
      );
      if (!recipient) {
        throw new NotFoundException(`This recipient does not exist`);
      }

      if (statusRequired && recipient.status !== statusRequired) {
        throw new BadRequestException(
          `This recipient should be ${statusRequired}.`,
        );
      }

      return recipient;
    }
  }

  return mixin(MixinRecipientExistsPipe);
}
