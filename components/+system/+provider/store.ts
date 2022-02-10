import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { systemApi } from '../system.api';

export class Provider extends CloudObject {
  static kind = 'Provider';

  spec: {
    localName: string;
    thirdParty: boolean;
    accessKey: string;
    accessSecret: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const providerApi = new ObjectApi({
  kind: Provider.kind,
  isNamespaced: false,
  apiBase: '/apis/system.ddx2x.nip/v1/provider',
  objectConstructor: Provider,
  request: systemApi,
});

export class ProviderStore extends ObjectStore<Provider> {
  api = providerApi;

  constructor() {
    super();
  }
}

export const providerStore = new ProviderStore();

apiManager.registerStore(providerApi, providerStore);
