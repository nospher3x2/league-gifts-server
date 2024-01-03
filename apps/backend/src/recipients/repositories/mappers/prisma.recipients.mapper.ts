import { Region } from '@ezreal';
import { Recipient as RawRecipient } from '@prisma/client';
import { RecipientDomain } from '../../entities/recipient.domain';

export class PrismaRecipientsMapper {
  public static toDomain(raw: RawRecipient): RecipientDomain {
    if (!raw) {
      return null;
    }
    return new RecipientDomain({
      id: raw.id,
      name: raw.name,
      region: raw.region as keyof typeof Region,
      profileIconId: raw.profileIconId,
      requiredProfileIconId: raw.requiredProfileIconId,
      puuid: raw.puuid,
      status: raw.status,
      userId: raw.userId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
