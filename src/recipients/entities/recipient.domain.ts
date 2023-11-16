import { Exclude } from 'class-transformer';
import { RecipientStatus } from '../enums/recipient.status.enum';
import { randomUUID } from 'crypto';

export class RecipientDomain {
  public id: string;
  public name: string;
  public region: string;
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

  public isVerified(): boolean {
    return this.status === RecipientStatus.VERIFIED;
  }
}
