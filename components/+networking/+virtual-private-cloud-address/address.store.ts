import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { networkingApi } from '../networking.api';

export class Address extends CloudObject {
  static kind = 'Address';

  spec: {
    ipforsort: string;
    area: string;
    type: string;
    ipversion: string;
    user: string;
    networktier: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const addressApi = new ObjectApi({
  kind: Address.kind,
  isNamespaced: true,
  apiBase: '/apis/networking.ddx2x.nip/v1/address',
  objectConstructor: Address,
  request: networkingApi,
});

export class AddressStore extends ObjectStore<Address> {
  api = addressApi;

  constructor() {
    super();
  }
}

export const addressStore = new AddressStore();

apiManager.registerStore(addressApi, addressStore);
