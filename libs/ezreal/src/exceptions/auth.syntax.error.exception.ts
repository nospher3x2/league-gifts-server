import { AuthException } from './auth.exception';

export class AuthSyntaxErrorException extends AuthException {
  constructor(info: string) {
    super(`Syntax Error: ${info}`);
  }
}
