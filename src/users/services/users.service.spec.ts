import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule, PasswordModule } from '@common';
import { PrismaUsersRepository } from '../repositories/prisma/prisma.users.repository';
import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users.repository';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, PasswordModule],
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useClass: PrismaUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a one user', async () => {
      const user = await service.createOne({
        email: 'johndoe@email.com',
        name: 'John Doe',
        password: 'password',
        confirmPassword: 'password',
      });

      expect(user).toBeDefined();
    });

    it('should not create a one user with same email', async () => {
      const email = 'johndoe@gmail.com';
      try {
        await service.createOne({
          email: email,
          name: 'John Doe2',
          password: 'password',
          confirmPassword: 'password',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('find', () => {
    it('should find a one user by id', async () => {
      const user = await service.createOne({
        email: 'johndoe@email.com',
        name: 'John Doe',
        password: 'password',
        confirmPassword: 'password',
      });

      const foundUser = await service.findOneById(user.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
    });

    it('should not find a one user by id', async () => {
      const foundUser = await service.findOneById('invalid-id');
      expect(foundUser).toBeNull();
    });
  });
});
