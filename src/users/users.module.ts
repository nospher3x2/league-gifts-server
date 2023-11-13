import { Module } from '@nestjs/common';
import { DatabaseModule, PasswordModule } from '@common';
import { UsersController } from './controllers/users.controller';
import { PrismaUsersRepository } from './repositories/prisma/prisma.users.repository';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';

@Module({
  imports: [DatabaseModule, PasswordModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
