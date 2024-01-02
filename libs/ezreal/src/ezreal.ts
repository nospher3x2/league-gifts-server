import axios from 'axios';
import { AccountSession } from './interfaces/account.session.interface';
import { Summoner } from './interfaces/summoner.interface';
import { AuthProvider } from './providers/auth.provider';
import { HydraAuthProvider } from './providers/implementations/hydra.auth.provider';
import { EzrealConfig } from './config/ezreal.config';

class Ezreal {
  private static authProvider: AuthProvider = new HydraAuthProvider();

  public static async authenticate(
    username: string,
    password: string,
    ledgeAuth: boolean = false,
  ): Promise<AccountSession> {
    const session = await Ezreal.authProvider.handle(username, password);
    if (!ledgeAuth) {
      return session;
    }

    return Ezreal.authenticateOnLedge(session);
  }

  public static async authenticateOnLedge(
    session: AccountSession,
  ): Promise<AccountSession> {
    const userInfoToken = await this.getUserInfoToken(session);
    console.log(userInfoToken);

    session.userInfoToken = userInfoToken;

    const sessionQueueToken = await this.getSessionQueueToken(session);
    session.sessionQueueToken = sessionQueueToken.token;
    session.sessionQueueTokenExpireAt = sessionQueueToken.expireAt;

    return session;
  }

  public static async getUserInfoToken(
    session: AccountSession,
  ): Promise<string> {
    return axios
      .post<string>(
        `${EzrealConfig.RIOT_AUTH_URL}/userinfo`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.partnerToken}`,
          },
        },
      )
      .then((response) => response.data);
  }

  public static async getSessionQueueToken(session: AccountSession): Promise<{
    token: string;
    expireAt: Date;
  }> {
    if (!session.userInfoToken) {
      throw new Error('Session does not have a userInfoToken');
    }

    const loginQueueUrl =
      EzrealConfig.LEAGUE_LOGIN_QUEUE_API_URL[session.region];
    const sessionAuthorization = await axios
      .post<{
        token: string;
      }>(
        `${loginQueueUrl}/login-queue/v2/login/products/lol/regions/${session.region}`,
        {
          clientName: 'lcu',
          userinfo: session.userInfoToken,
        },
        {
          headers: {
            Authorization: `Bearer ${session.partnerToken}`,
          },
        },
      )
      .then((response) => response.data.token);

    const sessionQueueToken = await axios
      .post<string>(
        `${loginQueueUrl}/session-external/v1/session/create`,
        {
          claims: {
            cname: 'lcu',
          },
          product: 'lol',
          puuid: session.id,
          region: session.region.toLowerCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${sessionAuthorization}`,
          },
        },
      )
      .then((response) => response.data);

    const sessionQueueTokenPayload = JSON.parse(
      Buffer.from(sessionQueueToken.split('.')[1], 'base64').toString(),
    );

    return {
      token: sessionQueueToken,
      expireAt: new Date(sessionQueueTokenPayload.exp * 1000),
    };
  }

  public static async getStoreWallet(
    session: AccountSession,
  ): Promise<{ ip: number; rp: number }> {
    return await Ezreal.ledge(session)
      .get<{ ip: number; rp: number }>('/storefront/v2/wallet')
      .then((response) => response.data);
  }

  public static async getStoreCatalog(
    session: AccountSession,
    language: string = 'en_US',
  ): Promise<any> {
    return await Ezreal.ledge(session)
      .get<any>('/storefront/v1/catalog', {
        params: {
          region: session.region,
          language: language,
        },
      })
      .then((response) => response.data)
      .catch((error) => Error(error.response.data));
  }

  public static async getSummonersByPuuids(
    session: AccountSession,
    puuid: string[],
  ): Promise<Summoner[]> {
    return await Ezreal.ledge(session)
      .post<Summoner[]>(
        `/summoner-ledge/v1/regions/${session.region}/summoners/puuids`,
        puuid,
      )
      .then((response) => response.data);
  }

  public static async getAliasesByGameNameAndTagLine(
    session: AccountSession,
    gameName: string,
    tagLine: string,
  ): Promise<{ puuid: string }[]> {
    return await Ezreal.ledge(session)
      .get<{ puuid: string }[]>(`/aliases/v1/aliases`, {
        params: {
          gameName,
          tagLine,
        },
      })
      .then((response) => response.data);
  }

  private static ledge(session: AccountSession) {
    const api = axios.create({
      baseURL: EzrealConfig.LEAGUE_EDGE_API_URL[session.region],
    });

    api.interceptors.request.use((config) => {
      const token = config.url.includes('storefront/')
        ? session.partnerToken
        : session.sessionQueueToken;

      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return api;
  }
}

export { Ezreal };
