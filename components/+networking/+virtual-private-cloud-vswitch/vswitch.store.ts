import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { networkingApi } from '../networking.api';

export class VSwitch extends CloudObject {
  static kind = 'VSwitch';

  spec: {
    local_name: string;
    ip: string;
    mask: string;
    region: string;
    zone: string;
    id?: string;
    vpc_id: string;
    status?: string;
    describe?: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const vSwitchApi = new ObjectApi({
  kind: VSwitch.kind,
  isNamespaced: true,
  apiBase: '/apis/networking.ddx2x.nip/v1/vswitch',
  objectConstructor: VSwitch,
  request: networkingApi,
});

export class VSwitchStore extends ObjectStore<VSwitch> {
  api = vSwitchApi;

  constructor() {
    super();
  }
}

export const vswitchStore = new VSwitchStore();

apiManager.registerStore(vSwitchApi, vswitchStore);
