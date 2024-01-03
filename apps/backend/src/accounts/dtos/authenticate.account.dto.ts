import { IsNotEmpty, IsString } from 'class-validator';
import { LeagueAccountType } from '../enums/league.account.type.enum';

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
