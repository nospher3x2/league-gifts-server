import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from '../services/store.service';
import { plainToInstance } from 'class-transformer';
import { Region } from '@ezreal';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { StoreItemWithFlatPriceDomain, StoreItemDomain } from '@common/store';

@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('items')
  public async getItems(
    @Query('region', new ParseEnumPipe(Region))
    region: keyof typeof Region,
  ): Promise<StoreItemWithFlatPriceDomain[]> {
    const items = await this.storeService.findAllStoreItems();
    return items.map((item) => {
      const itemInstance = plainToInstance(StoreItemDomain, item);
      return {
        ...itemInstance,
        flatPrice: this.storeService.getFlatItemPriceByRegion(
          item.price,
          item.currency,
          region,
        ),
      };
    });
  }

  @Get('items/:offerId')
  public async getItemById(
    @Param('offerId', new ParseUUIDPipe())
    offerId: string,
    @Query('region', new ParseEnumPipe(Region))
    region: keyof typeof Region,
  ): Promise<StoreItemWithFlatPriceDomain> {
    const item = plainToInstance(
      StoreItemDomain,
      await this.storeService.findOneStoreItemByOfferId(offerId),
    );

    return {
      ...item,
      flatPrice: this.storeService.getFlatItemPriceByRegion(
        item.price,
        item.currency,
        region,
      ),
    };
  }

  @Post('items/repopulate')
  public async repopulate(): Promise<void> {
    await this.storeService.repopulateStoreItemsCache();
  }
}
