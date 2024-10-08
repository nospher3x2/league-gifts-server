import { StoreItemCurrency } from './store.item.currency.enum';

export class StoreItemDomain {
  public itemId: number;
  public inventoryType: string;
  public subInventoryType?: string | null;
  public iconUrl: string;
  public currency: keyof typeof StoreItemCurrency;
  public price: number;
  public name: string;
  public offerId: string;

  constructor(partial: Partial<StoreItemDomain>) {
    Object.assign(this, partial);
  }
}

export class StoreItemWithFlatPriceDomain extends StoreItemDomain {
  public flatPrice: number;

  constructor(partial: Partial<StoreItemWithFlatPriceDomain>) {
    super(partial);
    Object.assign(this, partial);
  }
}
