import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule, PasswordModule } from '@common';
import { PrismaUsersRepository } from '../repositories/implementations/prisma.users.repository';
import { UsersRepository } from '../repositories/users.repository';
import { UsersService } from '../services/users.service';
import { UsersController } from './users.controller';

describe('UserController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, PasswordModule],
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useClass: PrismaUsersRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
