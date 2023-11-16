import { Injectable } from '@nestjs/common';
import { RecipientsRepository } from '../recipients.repository';
import { RecipientDomain } from 'src/recipients/entities/recipient.domain';
import { PrismaService } from '@common';
import { PrismaRecipientsMapper } from '../mappers/prisma.recipients.mapper';
import { randomUUID } from 'crypto';

@Injectable()
export class PrismaRecipientsRepository implements RecipientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findAllByUserId(userId: string): Promise<RecipientDomain[]> {
    const recipients = await this.prisma.recipient.findMany({
      where: {
        userId,
      },
    });

    if (!recipients || recipients.length === 0) {
      return [];
    }

    return recipients.map(PrismaRecipientsMapper.toDomain);
  }

  public async findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<RecipientDomain | null> {
    const recipient = await this.prisma.recipient.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!recipient) {
      return null;
    }

    return PrismaRecipientsMapper.toDomain(recipient);
  }

  public async countOneByPuuidAndUserId(
    puuid: string,
    userId: string,
  ): Promise<number> {
    return this.prisma.recipient.count({
      where: {
        puuid,
        userId,
      },
      take: 1,
    });
  }

  public async createOne(recipient: RecipientDomain): Promise<RecipientDomain> {
    const result = await this.prisma.recipient.create({
      data: {
        id: recipient.id ?? randomUUID(),
        name: recipient.name,
        region: recipient.region,
        profileIconId: recipient.profileIconId,
        requiredProfileIconId: recipient.requiredProfileIconId,
        puuid: recipient.puuid,
        status: recipient.status ?? 'PENDING',
        userId: recipient.userId,
      },
    });

    return PrismaRecipientsMapper.toDomain(result);
  }

  public async saveOne(recipient: RecipientDomain): Promise<RecipientDomain> {
    const result = await this.prisma.recipient.update({
      where: {
        id: recipient.id,
      },
      data: {
        name: recipient.name,
        region: recipient.region,
        profileIconId: recipient.profileIconId,
        requiredProfileIconId: recipient.requiredProfileIconId,
        puuid: recipient.puuid,
        status: recipient.status,
        userId: recipient.userId,
      },
    });

    return PrismaRecipientsMapper.toDomain(result);
  }
}
