import { Exclude } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Region } from '@ezreal';
import { RecipientStatus } from './recipient.status.enum';

export class RecipientDomain {
  public id: string;
  public name: string;
  public region: keyof typeof Region;
  public profileIconId: number;
  public requiredProfileIconId: number;
  @Exclude()
  public puuid: string;
  public status: keyof typeof RecipientStatus;
  @Exclude()
  public userId: string;
  @Exclude()
  public createdAt: Date;
  @Exclude()
  public updatedAt: Date;

  constructor(partial: Partial<RecipientDomain>) {
    Object.assign(this, partial);

    if (!this.id) {
      this.id = randomUUID();
    }
  }

  public isPending(): boolean {
    return this.status === RecipientStatus.PENDING;
  }

  public isVerified(): boolean {
    return this.status === RecipientStatus.VERIFIED;
  }

  public isRemoved(): boolean {
    return this.status === RecipientStatus.REMOVED;
  }
}
