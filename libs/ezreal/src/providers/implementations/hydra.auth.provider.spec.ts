import { AuthInvalidCredentialsException } from '@ezreal/exceptions/auth.invalid.credentials.exception';
import { AuthMultifactorEnabledException } from '@ezreal/exceptions/auth.multifactor.enabled.exception';
import { AuthSyntaxErrorException } from '@ezreal/exceptions/auth.syntax.error.exception';
import { HydraAuthProvider } from './hydra.auth.provider';
import { EzrealConfig } from '@ezreal/config/ezreal.config';

const accountWithValidCredentials = {
  username: 'withoutSpheres',
  password: 'withoutSpheres@',
};

const accountWithMfaEnabled = {
  username: 'accountWithMfa',
  password: 'AccountWith2FA',
};

describe('HydraAuthProvider', () => {
  let config: EzrealConfig;
  let provider: HydraAuthProvider;

  beforeEach(() => {
    config = new EzrealConfig();
    provider = new HydraAuthProvider(config);
  });

  describe('handle', () => {
    it('should return an account session', async () => {
      const session = await provider.handle(
        accountWithValidCredentials.username,
        accountWithValidCredentials.password,
      );

      expect(session).toHaveProperty('id');
    });

    it('should throw an AuthInvalidCredentialsException if the credentials are invalid', async () => {
      await expect(
        provider.handle('randomUsername', 'randomPassword'),
      ).rejects.toThrow(AuthInvalidCredentialsException);
    });

    it('should throw an AuthMultifactorEnabledException if the account has 2FA enabled', async () => {
      await expect(
        provider.handle(
          accountWithMfaEnabled.username,
          accountWithMfaEnabled.password,
        ),
      ).rejects.toThrow(AuthMultifactorEnabledException);
    });

    it('should throw an AuthSyntaxErrorException if the clientId is invalid', async () => {
      await expect(
        provider.handle(
          accountWithValidCredentials.username,
          accountWithValidCredentials.password,
          'invalidClientId',
        ),
      ).rejects.toThrow(AuthSyntaxErrorException);
    });

    it('should throw an AuthSyntaxErrorException if the HNKey is invalid', async () => {
      const mockConfig = jest.fn().mockImplementation(() => ({
        ...config,
        HYDRA_AUTH_KEY: 'invalidHNKey',
      }));

      const mockProvider = new HydraAuthProvider(mockConfig());
      await expect(
        mockProvider.handle(
          accountWithValidCredentials.username,
          accountWithValidCredentials.password,
        ),
      ).rejects.toThrow(AuthSyntaxErrorException);
    });
  });
});
