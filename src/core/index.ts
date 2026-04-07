export class AppEvent<TEventParam> {
  listenerFunctions: ((eventParam: TEventParam) => void)[];
  constructor() {
    this.listenerFunctions = [];
  }

  addListener(listenerFunction: (eventParam: TEventParam) => void) {
    this.listenerFunctions.push(listenerFunction);
  }

  trigger(eventParamObject: TEventParam) {
    this.listenerFunctions.forEach((listenerFunction) => listenerFunction(eventParamObject));
  }
}

export abstract class DataQuery<TData> implements IDataQuery<TData> {
  protected error: unknown | null;
  protected data: TData | null;
  constructor() {
    this.data = null;
    this.error = null;
  }

  getError() {
    return this.error;
  }

  getData() {
    return this.data;
  }

  abstract execute(callback: (dataQuery: IDataQuery<TData>) => void): void;
}

export type IDataQuery<TData> = {
  getError: () => unknown;
  getData: () => TData | null;
  execute: (callback: (dataQuery: IDataQuery<TData>) => void) => void;
};
