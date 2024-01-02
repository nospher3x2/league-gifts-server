import { Region } from '../enums/region.enum';

export interface AccountSession {
  id: string;
  region: keyof typeof Region;
  partnerToken: string;
  partnerTokenExpireAt: Date;
  userInfoToken?: string;
  sessionQueueToken?: string;
  sessionQueueTokenExpireAt?: Date;
}
