import { AuthException } from './auth.exception';

export class AuthInvalidCredentialsException extends AuthException {
  constructor() {
    super('Invalid Credentials');
  }
}
