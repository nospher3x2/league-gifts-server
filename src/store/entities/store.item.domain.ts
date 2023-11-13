import { Exclude } from 'class-transformer';
import { StoreItemCurrency } from '../enums/store.item.currency.enum';
import { StoreItemStatus } from '../enums/store.item.status.enum';

export class StoreItemDomain {
  public id: string;
  public name: string;
  public iconUrl: string;
  @Exclude()
  public status: keyof typeof StoreItemStatus;
  @Exclude()
  public currency: keyof typeof StoreItemCurrency;
  public price: number;
  @Exclude()
  public offerId: string;
  public inventoryType: string;
  public subInventoryType?: string | null;
  @Exclude()
  public createdAt: Date;
  @Exclude()
  public updatedAt: Date;
}
