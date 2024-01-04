import { RecipientDomain } from '@common/recipients';

export abstract class RecipientsRepository {
  public abstract findAllByUserId(userId: string): Promise<RecipientDomain[]>;

  public abstract findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<RecipientDomain | null>;

  public abstract findOneByPuuidAndUserId(
    puuid: string,
    userId: string,
  ): Promise<RecipientDomain | null>;

  public abstract countManyByUserId(
    userId: string,
    limit: number,
  ): Promise<number>;

  public abstract countOneByPuuidAndUserId(
    puuid: string,
    userId: string,
  ): Promise<number>;

  public abstract createOne(
    recipient: RecipientDomain,
  ): Promise<RecipientDomain>;

  public abstract saveOne(recipient: RecipientDomain): Promise<RecipientDomain>;

  public abstract deleteOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<void>;
}
