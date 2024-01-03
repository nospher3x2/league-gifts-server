import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccountsService } from '../services/accounts.service';
import { AuthenticateAccountDto } from '../dtos/authenticate.account.dto';
import { LeagueAccountDomain } from '../entities/league.account.domain';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

@Controller('/accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  public async findAll() {
    const accounts = await this.accountsService.findAll();
    return accounts.map((account) =>
      plainToInstance(LeagueAccountDomain, account),
    );
  }

  @Post('/auth')
  public async authenticate(
    @Body() authenticateAccountDto: AuthenticateAccountDto,
  ) {
    return await this.accountsService.authenticate(
      authenticateAccountDto.username,
      authenticateAccountDto.password,
      authenticateAccountDto.type,
    );
  }
}
