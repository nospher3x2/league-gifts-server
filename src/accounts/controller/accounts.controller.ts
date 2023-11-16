import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccountsService } from '../services/accounts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AuthenticateAccountDto } from '../dtos/authenticate.account.dto';
import { LeagueAccountDomain } from '../entities/league.account.domain';
import { plainToInstance } from 'class-transformer';

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
    return plainToInstance(
      LeagueAccountDomain,
      await this.accountsService.authenticate(
        authenticateAccountDto.username,
        authenticateAccountDto.password,
        authenticateAccountDto.type,
      ),
    );
  }
}
