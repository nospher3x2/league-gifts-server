import { IsNotEmpty, IsString } from 'class-validator';
import { RecipientDomain } from '../entities/recipient.domain';

export class CreateRecipientDto
  implements Pick<RecipientDomain, 'name' | 'region'>
{
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public region: string;
}
