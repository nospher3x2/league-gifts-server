import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { StoreItemDomain } from '../entities/store.item.domain';
import { StoreService } from '../services/store.service';

interface StoreItemWithFlatPrice extends StoreItemDomain {
  flatPrice: number;
}

@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('items')
  public async getItems(
    @Query('region') region: string = 'BR1',
  ): Promise<StoreItemWithFlatPrice[]> {
    const items = await this.storeService.findAllActiveItems();
    return items.map((item) => ({
      ...item,
      flatPrice: this.storeService.getFlatItemPriceByRegion(
        item.price,
        item.currency,
        region,
      ),
    }));
  }

  @Get('items/:id')
  public async getItemById(
    @Param('id') id: string,
    @Query('region') region: string = 'BR1',
  ): Promise<StoreItemWithFlatPrice> {
    const item = await this.storeService.findOneActiveItemById(id);
    return {
      ...item,
      flatPrice: this.storeService.getFlatItemPriceByRegion(
        item.price,
        item.currency,
        region,
      ),
    };
  }

  @Post('items/reload')
  public async reloadItems(): Promise<void> {
    // await this.storeService.recreateAllItems();
    // return {};
  }
}
