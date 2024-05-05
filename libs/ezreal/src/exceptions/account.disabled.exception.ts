export class AccountDisabledException extends Error {
  constructor() {
    super('Account is disabled');
  }
}
