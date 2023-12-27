import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { StoreItemDomain } from '../entities/store.item.domain';
import { StoreService } from '../services/store.service';
import { plainToInstance } from 'class-transformer';
import { LeagueAccountRegion } from 'src/accounts/enums/league.account.region.enum';

interface StoreItemWithFlatPrice extends StoreItemDomain {
  flatPrice: number;
}

@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('items')
  public async getItems(
    @Query('region', new ParseEnumPipe(LeagueAccountRegion))
    region: keyof typeof LeagueAccountRegion,
  ): Promise<StoreItemWithFlatPrice[]> {
    const items = await this.storeService.findAllActiveItems();
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

  @Get('items/:id')
  public async getItemById(
    @Param('id') id: string,
    @Query('region', new ParseEnumPipe(LeagueAccountRegion))
    region: keyof typeof LeagueAccountRegion,
  ): Promise<StoreItemWithFlatPrice> {
    const item = plainToInstance(
      StoreItemDomain,
      await this.storeService.findOneActiveItemById(id),
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

  @Post('items/reload')
  public async reloadItems(): Promise<void> {
    // await this.storeService.recreateAllItems();
    // return {};
  }
}
