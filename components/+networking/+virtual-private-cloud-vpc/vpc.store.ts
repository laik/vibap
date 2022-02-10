import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { networkingApi } from '../networking.api';

export class Vpc extends CloudObject {
  static kind = 'VPC';

  spec: {
    local_name: string;
    ip: string;
    mask: string;
    region: string;
    status?: string;
    id?: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const vpcApi = new ObjectApi({
  kind: Vpc.kind,
  isNamespaced: true,
  apiBase: '/apis/networking.ddx2x.nip/v1/vpc',
  objectConstructor: Vpc,
  request: networkingApi,
});

export class VpcStore extends ObjectStore<Vpc> {
  api = vpcApi;

  constructor() {
    super();
  }
}

export const vpcStore = new VpcStore();

apiManager.registerStore(vpcApi, vpcStore);
