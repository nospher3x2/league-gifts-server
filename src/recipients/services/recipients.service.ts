import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecipientsRepository } from '../repositories/recipients.repository';
import { RecipientDomain } from '../entities/recipient.domain';
import { CreateRecipientDto } from '../dtos/create.recipient.dto';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { randomUUID } from 'crypto';
import { RecipientStatus } from '../enums/recipient.status.enum';

@Injectable()
export class RecipientsService {
  private static readonly MAX_RECIPIENTS = 3;

  constructor(
    private readonly accountsService: AccountsService,
    private readonly recipientsRepository: RecipientsRepository,
  ) {}

  public async findAllByUserId(userId: string): Promise<RecipientDomain[]> {
    return this.recipientsRepository.findAllByUserId(userId);
  }

  public async findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<RecipientDomain | null> {
    return this.recipientsRepository.findOneByIdAndUserId(id, userId);
  }

  public async findOneByPuuidAndUserId(
    puuid: string,
    userId: string,
  ): Promise<RecipientDomain | null> {
    return this.recipientsRepository.findOneByPuuidAndUserId(puuid, userId);
  }

  public async countManyByUserId(
    userId: string,
    limit: number,
  ): Promise<number> {
    return this.recipientsRepository.countManyByUserId(userId, limit);
  }

  public async createOne(
    createRecipientDto: CreateRecipientDto,
    userId: string,
  ): Promise<RecipientDomain> {
    const recipientsCount = await this.countManyByUserId(userId, 3);
    if (recipientsCount >= RecipientsService.MAX_RECIPIENTS) {
      throw new BadRequestException(
        `You can only have 3 recipients at the same time. Please remove one and try again.`,
      );
    }

    const manager = await this.accountsService.findOneManagerAccount(
      createRecipientDto.region,
    );

    const [gameName, tagLine] = createRecipientDto.name.split('#');
    const aliases = await this.accountsService.getAliasesByGameNameAndTagLine(
      manager,
      gameName,
      tagLine,
    );

    if (!aliases) {
      throw new NotFoundException(
        `Summoner ${createRecipientDto.name} not found, please check if the name and tag is correct and try again.`,
      );
    }

    const summoner = await this.accountsService.getSummonerByPuuid(
      manager,
      aliases.puuid,
    );

    if (!summoner) {
      throw new NotFoundException(
        `Summoner ${createRecipientDto.name} not found, please check the region selected and try again.`,
      );
    }

    const randomProfileIconId = Math.floor(Math.random() * 26) + 1;
    const requiredProfileIconId =
      summoner.profileIconId === randomProfileIconId
        ? randomProfileIconId - 1
        : randomProfileIconId;

    const alreadyCreatedRecipient = await this.findOneByPuuidAndUserId(
      aliases.puuid,
      userId,
    );

    if (alreadyCreatedRecipient) {
      if (alreadyCreatedRecipient.isRemoved()) {
        alreadyCreatedRecipient.status = RecipientStatus.PENDING;
        alreadyCreatedRecipient.requiredProfileIconId = requiredProfileIconId;
        return this.recipientsRepository.saveOne(alreadyCreatedRecipient);
      }

      const status = alreadyCreatedRecipient.isVerified()
        ? 'verified'
        : 'pending';

      throw new ConflictException(
        `Recipient ${createRecipientDto.name} is already ${status}.`,
      );
    }

    const recipient = new RecipientDomain({
      id: randomUUID(),
      name: createRecipientDto.name,
      region: createRecipientDto.region,
      puuid: aliases.puuid,
      profileIconId: summoner.profileIconId,
      requiredProfileIconId: requiredProfileIconId,
      status: RecipientStatus.PENDING,
      userId: userId,
    });

    return this.recipientsRepository.createOne(recipient);
  }

  public async updateOneIfChangedProfileIconToRequired(
    recipientId: string,
    userId: string,
  ): Promise<RecipientDomain> {
    const recipient = await this.findOneByIdAndUserId(recipientId, userId);
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    if (recipient.isVerified()) {
      throw new ConflictException('Recipient is already verified');
    }

    const manager = await this.accountsService.findOneManagerAccount(
      recipient.region,
    );

    const summoner = await this.accountsService.getSummonerByPuuid(
      manager,
      recipient.puuid,
    );

    const requiredProfileIconIsSelected =
      summoner.profileIconId === recipient.requiredProfileIconId;

    if (!requiredProfileIconIsSelected) {
      throw new BadRequestException(
        `Recipient ${recipient.name} did not change profile icon to required icon (${recipient.requiredProfileIconId})`,
      );
    }

    recipient.status = RecipientStatus.VERIFIED;
    return this.recipientsRepository.saveOne(recipient);
  }

  public async deleteOne(recipientId: string, userId: string): Promise<void> {
    const recipient = await this.findOneByIdAndUserId(recipientId, userId);
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    if (recipient.isRemoved()) {
      throw new ConflictException('Recipient is already removed');
    }

    if (recipient.isVerified()) {
      recipient.status = 'REMOVED';
      await this.recipientsRepository.saveOne(recipient);
      return;
    }

    await this.recipientsRepository.deleteOneByIdAndUserId(recipientId, userId);
  }
}
