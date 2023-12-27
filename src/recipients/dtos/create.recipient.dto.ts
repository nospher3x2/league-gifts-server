import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { RecipientDomain } from '../entities/recipient.domain';
import { LeagueAccountRegion } from 'src/accounts/enums/league.account.region.enum';

export class CreateRecipientDto
  implements Pick<RecipientDomain, 'name' | 'region'>
{
  @IsString()
  @IsNotEmpty()
  @ValidateIf((_, value: string) => value.includes('#'), {
    message: 'The name should be in the format: GameName#TagLine',
  })
  public name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(LeagueAccountRegion)
  public region: keyof typeof LeagueAccountRegion;
}
