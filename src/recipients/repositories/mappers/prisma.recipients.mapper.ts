import { Recipient as RawRecipient } from '@prisma/client';
import { LeagueAccountRegion } from 'src/accounts/enums/league.account.region.enum';
import { RecipientDomain } from 'src/recipients/entities/recipient.domain';

export class PrismaRecipientsMapper {
  public static toDomain(raw: RawRecipient): RecipientDomain {
    if (!raw) {
      return null;
    }
    return new RecipientDomain({
      id: raw.id,
      name: raw.name,
      region: raw.region as keyof typeof LeagueAccountRegion,
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
