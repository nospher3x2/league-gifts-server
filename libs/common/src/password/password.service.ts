import * as bcrypt from 'bcrypt';

export class PasswordService {
  public hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
