import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccountsService } from '../services/accounts.service';
import { AuthenticateAccountDto } from '../dtos/authenticate.account.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { LeagueAccountDomain } from '@common/accounts';

@Controller('/accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  public async findAll(): Promise<LeagueAccountDomain[]> {
    const accounts = await this.accountsService.findAll();
    return accounts.map((account) =>
      plainToInstance(LeagueAccountDomain, account),
    );
  }

  @Post('/auth')
  public async authenticate(
    @Body() authenticateAccountDto: AuthenticateAccountDto,
  ): Promise<LeagueAccountDomain> {
    return await this.accountsService.authenticate(
      authenticateAccountDto.username,
      authenticateAccountDto.password,
      authenticateAccountDto.type,
    );
  }
}
