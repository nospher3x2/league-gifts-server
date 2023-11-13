import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('UserService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'password';
      const hash = await service.hashPassword(password);
      expect(hash).toBeDefined();
    });

    it('should hash a password and return a different value', async () => {
      const password = 'password';
      const hash = await service.hashPassword(password);
      expect(hash).not.toBe(password);
    });
  });

  describe('compare', () => {
    it('should compare a password and hash', async () => {
      const password = 'password';
      const hash = await service.hashPassword(password);
      const compare = await service.comparePassword(password, hash);
      expect(compare).toBe(true);
    });
  });
});
