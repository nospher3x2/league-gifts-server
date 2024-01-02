import { Region } from '@ezreal/enums/region.enum';

export class EzrealConfig {
  public static readonly RIOT_AUTH_URL = 'https://auth.riotgames.com';
  public static readonly HYDRA_AUTH_URL = 'https://api.hydranetwork.org';
  public static readonly HYDRA_AUTH_KEY = process.env.HYDRA_AUTH_KEY;

  public static readonly RIOT_GAMES_ACCOUNT_API_URL =
    'https://api.account.riotgames.com';

  public static readonly LEAGUE_EDGE_API_URL: Record<
    keyof typeof Region,
    string
  > = {
    BR1: 'https://br-red.lol.sgp.pvp.net',
    EUN1: 'https://eune-red.lol.sgp.pvp.net',
    EUW1: 'https://euw-red.lol.sgp.pvp.net',
    LA1: 'https://lan-red.lol.sgp.pvp.net',
    LA2: 'https://las-red.lol.sgp.pvp.net',
    NA1: 'https://na-red.lol.sgp.pvp.net',
    OC1: 'https://oce-red.lol.sgp.pvp.net',
    RU: 'https://ru-red.lol.sgp.pvp.net',
    TR1: 'https://tr-red.lol.sgp.pvp.net',
    JP1: 'https://jp-red.lol.sgp.pvp.net',
    KR: 'https://kr-red.lol.sgp.pvp.net',
    SG2: 'https://sg2-red.lol.sgp.pvp.net',
    PH2: 'https://ph2-red.lol.sgp.pvp.net',
    VN2: 'https://vn2-red.lol.sgp.pvp.net',
  };

  public static readonly LEAGUE_LOGIN_QUEUE_API_URL: Record<
    keyof typeof Region,
    string
  > = {
    BR1: 'https://usw2-green.pp.sgp.pvp.net',
    EUN1: 'https://euc1-green.pp.sgp.pvp.net',
    EUW1: 'https://euc1-green.pp.sgp.pvp.net',
    LA1: 'https://usw2-green.pp.sgp.pvp.net',
    LA2: 'https://usw2-green.pp.sgp.pvp.net',
    NA1: 'https://usw2-green.pp.sgp.pvp.net',
    OC1: 'https://apse1-green.pp.sgp.pvp.net',
    RU: 'https://euc1-green.pp.sgp.pvp.net',
    TR1: 'https://euc1-green.pp.sgp.pvp.net',
    KR: 'https://apne1-green.pp.sgp.pvp.net',
    JP1: 'https://apne1-green.pp.sgp.pvp.net',
    SG2: 'https://apse1-green.pp.sgp.pvp.net',
    PH2: 'https://ph2-red.lol.sgp.pvp.net',
    VN2: 'https://apse1-green.pp.sgp.pvp.net',
  };
}
