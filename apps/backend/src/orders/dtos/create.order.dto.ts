import { ArrayNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  public offerIds: string[];
}
