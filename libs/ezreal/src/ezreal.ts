import axios from 'axios';
import { AccountSession } from './interfaces/account.session.interface';
import { Summoner } from './interfaces/summoner.interface';
import { AuthProvider } from './providers/auth.provider';
import { HydraAuthProvider } from './providers/implementations/hydra.auth.provider';
import { EzrealConfig } from './config/ezreal.config';
import { CapOrder } from './interfaces/cap.order.interface';

class Ezreal {
  private static config: EzrealConfig = new EzrealConfig();
  private static authProvider: AuthProvider = new HydraAuthProvider(
    Ezreal.config,
  );

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
        `${Ezreal.config.RIOT_AUTH_URL}/userinfo`,
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
      Ezreal.config.LEAGUE_LOGIN_QUEUE_API_URL[session.region];
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
    return await axios
      .get<{ puuid: string }[]>(
        `${Ezreal.config.RIOT_GAMES_ACCOUNT_API_URL}/aliases/v1/aliases`,
        {
          params: {
            gameName,
            tagLine,
          },
          headers: {
            Authorization: `Bearer ${session.partnerToken}`,
          },
        },
      )
      .then((response) => response.data);
  }

  public static async createCapOrder(
    session: AccountSession,
    offerId: string,
    paymentOption: 'RP' | 'IP',
    purchaserName: string,
    recipientId: string,
    recipientName: string,
    giftMessage: string,
    orderId: string,
  ): Promise<CapOrder> {
    return Ezreal.ledge(session)
      .post<{ data: CapOrder }>(
        `/services/cap/orders/orders-api/v2/products/d1c2664a-5938-4c41-8d1b-61fd51052c22/orders`,
        {
          data: {
            id: '',
            purchaser: {
              id: session.id,
            },
            location: location,
            subOrders: [
              {
                offer: {
                  id: offerId,
                  productId: 'd1c2664a-5938-4c41-8d1b-61fd51052c22',
                },
                offerContext: {
                  paymentOption: paymentOption,
                  quantity: 1,
                  purchaserName: purchaserName,
                  recipientName: recipientName,
                  giftMessage: giftMessage,
                },
                recipientId: recipientId,
              },
            ],
          },
          meta: {
            correlationId: '',
            jwt: '',
            xid: orderId,
          },
        },
      )
      .then((response) => response.data.data);
  }

  public async getCapOrderByOrderId(
    session: AccountSession,
    orderId: string,
  ): Promise<CapOrder> {
    return Ezreal.ledge(session)
      .get<CapOrder>(`/storefront/v2/getCapOrder`, {
        params: {
          orderId: orderId,
        },
      })
      .then((response) => response.data);
  }

  private static ledge(session: AccountSession) {
    const api = axios.create({
      baseURL: Ezreal.config.LEAGUE_EDGE_API_URL[session.region],
    });

    api.interceptors.request.use((config) => {
      const token =
        config.url.includes('storefront/') ||
        config.url.includes('cap/orders/orders-api')
          ? session.partnerToken
          : session.sessionQueueToken;

      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return api;
  }
}

export { Ezreal };
