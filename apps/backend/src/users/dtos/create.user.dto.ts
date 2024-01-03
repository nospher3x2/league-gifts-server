import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserDomain } from '../domain/user.domain';
import { PasswordDto } from '@common/password/password.dto';

export class CreateUserDto
  extends PasswordDto
  implements Pick<UserDomain, 'name' | 'email' | 'password'>
{
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public readonly email: string;

  @IsString()
  @IsNotEmpty()
  public readonly name: string;
}
