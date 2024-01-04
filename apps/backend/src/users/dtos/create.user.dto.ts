import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { PasswordDto } from '@common/password/password.dto';
import { UserDomain } from '@common/users';

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
