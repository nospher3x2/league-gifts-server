import { LeagueAccountType } from '@common/accounts';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthenticateAccountDto {
  @IsString()
  @IsNotEmpty()
  public username: string;

  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsString()
  public type: keyof typeof LeagueAccountType = 'GIFT';
}
