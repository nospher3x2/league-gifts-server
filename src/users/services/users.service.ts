import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PasswordService } from '@common/password';
import { UserDomain } from '../domain/user.domain';
import { CreateUserDto } from '../dtos/create.user.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly userRepository: UsersRepository,
  ) {}

  public async findOneById(id: string): Promise<UserDomain | null> {
    return this.userRepository.findOneById(id);
  }

  public async findOneByEmail(email: string): Promise<UserDomain | null> {
    return this.userRepository.findOneByEmail(email);
  }

  public async checkIfUserExistsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.countOneByEmail(email);
    return count === 1;
  }

  public async createOne(createUserDto: CreateUserDto): Promise<UserDomain> {
    const alreadyExistsUserWithSameEmail = await this.checkIfUserExistsByEmail(
      createUserDto.email,
    );

    if (alreadyExistsUserWithSameEmail) {
      throw new ConflictException('User with same email already exists');
    }

    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new UnprocessableEntityException('Passwords do not match');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    const user = await this.userRepository.createOne({
      ...createUserDto,
      password: hashedPassword,
    });

    delete user.password;
    return user;
  }
}
