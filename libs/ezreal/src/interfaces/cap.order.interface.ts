export interface CapOrder {
  id: string;
  created: string;
  lastModified: string;
  location: string;
  subOrders: {
    id: string;
    created: string;
    lastModified: string;
    recipientId: string;
    recipient: {
      id: string;
      typeId: string;
    };
    offer: {
      id: string;
      typeId: string;
      label: string;
      productId: string;
      merchantId: string;
      payload: {
        itemId: number;
        itemInstanceId: string;
        inventoryType: string;
        subInventoryType?: string | null;
        quantity: number;
        itemPriceMap: {
          [key: string]: number;
        };
      };
      active: boolean;
      startDate: string;
      endDate: string;
    };
    offerContext: {
      paymentOption: string;
      quantity: number;
    };
    status: string;
    productId: string;
    lineItems: any[];
  }[];
  purchaser: {
    id: string;
  };
  status: {
    status: string;
  };
  sourceUser: string;
  sourceIpAddress: string;
  sourceTransaction: string;
}
