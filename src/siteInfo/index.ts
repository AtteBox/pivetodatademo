import { IDataQuery } from '../core';

export type ISiteInfo = { [key: string]: string | number };

export type ISiteInfoQuery = IDataQuery<ISiteInfo> & {
  getSiteId: () => number | null;
};
