import { ArrayNotEmpty, IsString, IsUUID } from 'class-validator';
import { OrderDomain } from '../entities/order.domain';

export class CreateOrderDto implements Pick<OrderDomain, 'recipientId'> {
  @IsString()
  @IsUUID('4')
  public recipientId: string;

  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  public offerIds: string[];
}
