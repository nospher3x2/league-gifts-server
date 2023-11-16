export interface ISummoner {
  id: number;
  puuid: string;
  accountId: number;
  name: string;
  internalName: string;
  profileIconId: number;
  level: number;
  expPoints: number;
  levelAndXpVersion: number;
  revisionId: number;
  revisionDate: number;
  lastGameDate: number;
  nameChangeFlag: boolean;
  unnamed: boolean;
  privacy: 'PUBLIC' | 'PRIVATE';
  expToNextLevel: number;
}
