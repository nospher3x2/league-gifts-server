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

@Injectable()
export class RecipientsService {
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

  public async countManyByUserId(
    userId: string,
    limit: number,
  ): Promise<number> {
    return this.recipientsRepository.countManyByUserId(userId, limit);
  }

  public async checkIfRecipientExistsByPuuidAndUserId(
    puuid: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.recipientsRepository.countOneByPuuidAndUserId(
      puuid,
      userId,
    );

    return count === 1;
  }

  public async createOne(
    createRecipientDto: CreateRecipientDto,
    userId: string,
  ): Promise<RecipientDomain> {
    const recipientsCount = await this.countManyByUserId(userId, 3);
    if (recipientsCount >= 3) {
      throw new BadRequestException(
        `You can only have 3 recipients, please delete one and try again`,
      );
    }

    const manager = await this.accountsService.findOneManagerAccount(
      createRecipientDto.region,
    );

    const summoner = await this.accountsService.getSummonerByName(
      manager,
      createRecipientDto.name,
    );

    if (!summoner) {
      throw new NotFoundException(
        `Summoner ${createRecipientDto.name} not found, please check the name and the region and try again`,
      );
    }

    const alreadyExistsRecipientWithSamePuuid =
      await this.checkIfRecipientExistsByPuuidAndUserId(summoner.puuid, userId);

    if (alreadyExistsRecipientWithSamePuuid) {
      throw new ConflictException('Recipient with same puuid already exists');
    }

    const requiredProfileIconId = summoner.profileIconId === 7 ? 6 : 7;
    const recipient = new RecipientDomain({
      id: randomUUID(),
      name: summoner.name,
      region: createRecipientDto.region,
      puuid: summoner.puuid,
      profileIconId: summoner.profileIconId,
      requiredProfileIconId: requiredProfileIconId,
      status: 'PENDING',
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

    const summoner = await this.accountsService.getSummonerByName(
      manager,
      recipient.name,
    );

    const changed = summoner.profileIconId === recipient.requiredProfileIconId;
    if (!changed) {
      throw new BadRequestException(
        `Recipient ${recipient.name} did not change profile icon to required icon (${recipient.requiredProfileIconId})`,
      );
    }

    recipient.name = summoner.name;
    recipient.status = 'VERIFIED';
    return this.recipientsRepository.saveOne(recipient);
  }

  public async deleteOne(recipientId: string, userId: string): Promise<void> {
    const recipient = await this.findOneByIdAndUserId(recipientId, userId);
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    await this.recipientsRepository.deleteOneByIdAndUserId(recipientId, userId);
  }
}
