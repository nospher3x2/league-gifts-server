import { AuthException } from './auth.exception';

export class AuthUnknownErrorException extends AuthException {
  constructor(error: string) {
    super(`Unknown Error: ${error}`);
    this.name = 'AUTH_UNKNOWN_ERROR';
  }
}
