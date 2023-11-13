import { StoreItemStatus } from '@prisma/client';
import { StoreItemDomain } from '../entities/store.item.domain';
import { StoreItemCurrency } from '../enums/store.item.currency.enum';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStoreItemDto
  implements Omit<StoreItemDomain, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsString()
  public iconUrl: string;

  @IsNotEmpty()
  @IsEnum(StoreItemStatus)
  public status: keyof typeof StoreItemStatus;

  @IsNotEmpty()
  @IsEnum(StoreItemCurrency)
  public currency: keyof typeof StoreItemCurrency;

  @IsNotEmpty()
  @IsNumber()
  public price: number;

  @IsNotEmpty()
  @IsString()
  public offerId: string;

  @IsNotEmpty()
  @IsString()
  public inventoryType: string;

  @IsString()
  public subInventoryType?: string | null;
}
