import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserDomain } from '../domain/user.domain';

export class CreateUserDto
  implements Pick<UserDomain, 'name' | 'email' | 'password'>
{
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public readonly email: string;

  @IsString()
  @IsNotEmpty()
  public readonly name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  public readonly password: string;

  @IsString()
  @IsNotEmpty()
  public readonly confirmPassword: string;
}
