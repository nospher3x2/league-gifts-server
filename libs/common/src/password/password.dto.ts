import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  public readonly password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  public readonly confirmPassword: string;
}
