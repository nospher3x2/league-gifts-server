export interface IAuthSignInResponse {
  puuid: string;
  region: string;
  partnerToken: string;
  partnerTokenExpireAt: Date;
}

export abstract class AuthProvider {
  public abstract handle(
    username: string,
    password: string,
  ): Promise<IAuthSignInResponse>;
}
