import { apiManager, CloudObject, ObjectApi, ObjectStore } from '../../../client';
import { customApi } from '../api';
import Details from './details';

export class CustomData extends CloudObject {
  static kind = 'CustomData';
  spec: {
    [key: string]: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export class CustomDataStore<
  T extends CloudObject = any
> extends ObjectStore<T> {
  api: ObjectApi<T>;
}
export class CustomDataManager<T extends CloudObject = any> {
  #apis: Map<String, ObjectApi> = new Map();
  #stores: Map<String, CustomDataStore> = new Map();
  #inited: boolean = false;

  register(name: string, isNamespaced: boolean = true) {
    if (this.#apis.has(name)) {
      return;
    }
    const api = new ObjectApi({
      kind: name,
      isNamespaced: isNamespaced,
      apiBase: '/apis/cr.ddx2x.nip/v1/' + name,
      objectConstructor: CustomData,
      request: customApi,
    });

    this.#apis.set(name, api);
    let customDataStore = new CustomDataStore();
    customDataStore.api = api;
    this.#stores.set(name, customDataStore);
    apiManager.registerViews(api, {Details: Details});
    this.#inited = true;
  }

  isInited(): boolean {
    return this.#inited;
  }

  getApi(name: string): ObjectApi<T> {
    return this.#apis.get(name);
  }

  getStore(name: string): CustomDataStore {
    return this.#stores.get(name);
  }

  remove(name: string): void {
    this.#apis.delete(name);
    this.#stores.delete(name);
  }
}

export const crm = new CustomDataManager();
