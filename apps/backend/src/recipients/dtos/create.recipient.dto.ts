import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { Region } from '@ezreal';
import { RecipientDomain } from '@common/recipients';

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
  @IsEnum(Region)
  public region: keyof typeof Region;
}
