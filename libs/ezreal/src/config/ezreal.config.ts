import { Region } from '@ezreal/enums/region.enum';

export class EzrealConfig {
  public readonly RIOT_AUTH_URL = 'https://auth.riotgames.com';
  public readonly HYDRA_AUTH_URL = 'https://api.hydranetwork.org';
  public readonly HYDRA_AUTH_KEY = process.env.HYDRA_AUTH_KEY;

  public readonly RIOT_GAMES_ACCOUNT_API_URL =
    'https://api.account.riotgames.com';

  public readonly RIOT_GEO_PAS_API_URL =
    'https://riot-geo.pas.si.riotgames.com';

  public readonly LEAGUE_EDGE_API_URL: Record<keyof typeof Region, string> = {
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

  public readonly LEAGUE_LOGIN_QUEUE_API_URL: Record<
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

  public readonly RIOT_CHAT_SERVER_URL: Record<
    string,
    { host: string; prefix: string }
  > = {
    as2: {
      host: 'as2.chat.si.riotgames.com',
      prefix: 'as2',
    },
    asia: {
      host: 'jp1.chat.si.riotgames.com',
      prefix: 'jp',
    },
    br1: {
      host: 'br.chat.si.riotgames.com',
      prefix: 'br1',
    },
    eu: {
      host: 'ru1.chat.si.riotgames.com',
      prefix: 'ru1',
    },
    eu3: {
      host: 'eu3.chat.si.riotgames.com',
      prefix: 'eu3',
    },
    eun1: {
      host: 'eun1.chat.si.riotgames.com',
      prefix: 'eu2',
    },
    euw1: {
      host: 'euw1.chat.si.riotgames.com',
      prefix: 'eu1',
    },
    jp1: {
      host: 'jp1.chat.si.riotgames.com',
      prefix: 'jp1',
    },
    la1: {
      host: 'la1.chat.si.riotgames.com',
      prefix: 'la1',
    },
    la2: {
      host: 'la2.chat.si.riotgames.com',
      prefix: 'la2',
    },
    na1: {
      host: 'na2.chat.si.riotgames.com',
      prefix: 'na1',
    },
    oc1: {
      host: 'oc1.chat.si.riotgames.com',
      prefix: 'oc1',
    },
    ru1: {
      host: 'ru1.chat.si.riotgames.com',
      prefix: 'ru1',
    },
    sea1: {
      host: 'sa1.chat.si.riotgames.com',
      prefix: 'sa1',
    },
    sea2: {
      host: 'sa2.chat.si.riotgames.com',
      prefix: 'sa2',
    },
    sea3: {
      host: 'sa3.chat.si.riotgames.com',
      prefix: 'sa3',
    },
    sea4: {
      host: 'sa4.chat.si.riotgames.com',
      prefix: 'sa4',
    },
    sea5: {
      host: 'sa5.chat.si.riotgames.com',
      prefix: 'sa5',
    },
    tr1: {
      host: 'tr1.chat.si.riotgames.com',
      prefix: 'tr1',
    },
    us: {
      host: 'la1.chat.si.riotgames.com',
      prefix: 'la1',
    },
    'us-br1': {
      host: 'br.chat.si.riotgames.com',
      prefix: 'br1',
    },
    'us-la2': {
      host: 'la2.chat.si.riotgames.com',
      prefix: 'la2',
    },
    us2: {
      host: 'us2.chat.si.riotgames.com',
      prefix: 'us2',
    },
  };
}
