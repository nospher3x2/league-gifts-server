import { AuthException } from './auth.exception';

export class AuthInvalidCredentialsException extends AuthException {
  constructor() {
    super('The provided credentials are invalid.');
    this.name = 'AUTH_INVALID_CREDENTIALS';
  }
}
