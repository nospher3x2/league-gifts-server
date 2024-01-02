import { AccountSession } from '../interfaces/account.session.interface';

export abstract class AuthProvider {
  public abstract handle(
    username: string,
    password: string,
  ): Promise<AccountSession>;
}
