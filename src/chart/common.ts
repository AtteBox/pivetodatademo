import { IDataQuery } from '../core';

type IAddInfoAttributes = { [key: string]: string | number };

export class Result {
  private value: number;
  private date: Date;
  private unit: string;
  private measUnc: number | null;
  private addInfo: IAddInfoAttributes;

  constructor(
    value: number,
    date: Date,
    unit: string,
    measUnc: number | null = null,
    addInfo: IAddInfoAttributes = {},
  ) {
    this.value = value;
    this.date = date;
    this.unit = unit;
    this.measUnc = measUnc;
    this.addInfo = addInfo;
  }

  getValue(): number {
    return this.value;
  }

  getDate(): Date {
    return this.date;
  }

  getUnit(): string {
    return this.unit;
  }

  getMeasUnc(): number | null {
    return this.measUnc;
  }

  getAddInfo(): any {
    return this.addInfo;
  }

  toFlotArray(): (number | null)[] {
    return [this.getDate().getTime(), this.getValue(), this.getMeasUnc() !== null ? this.getMeasUnc() : 0];
  }
}

export type IResultSetQuery = IDataQuery<Result[]> & {
  execute: (callback: (resultSetQuery: IResultSetQuery) => void) => void;
  isResultSearchReady: () => boolean;
  getLabel: () => string;
  getInfoObj: () => { [x: string]: any };
};

export type IResultSetListQuery = {
  execute: (callback: (resultSetListQuery: IResultSetListQuery) => void) => void;
  getError: () => unknown;
  getAllResultSets: () => IResultSetQuery[];
  getResultSetByLabel: (label: string) => IResultSetQuery | null;
};
