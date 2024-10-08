import { AuthException } from './auth.exception';

export class AuthMultifactorEnabledException extends AuthException {
  constructor() {
    super('Multifactor authentication is enabled for this account.');
    this.name = 'AUTH_MULTIFACTOR_ENABLED';
  }
}
