import {CloudObject, ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {ObjectStore} from '../../../client/object.store';
import {systemApi} from '../system.api';

export class InstanceType extends CloudObject {
  static kind = 'Instancetype';

  spec: {
    cores: string;
    memory: string;
    region: string;
    id: string;
    zone: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const instanceTypeApi = new ObjectApi({
  kind: InstanceType.kind,
  isNamespaced: true,
  apiBase: '/apis/system.laik.fm/v1/instancetype',
  objectConstructor: InstanceType,
  request: systemApi,
});

export class InstanceTypeStore extends ObjectStore<InstanceType> {
  api = instanceTypeApi;

  constructor() {
    super();
  }
}

export const instanceTypeStore = new InstanceTypeStore();

apiManager.registerStore(instanceTypeApi, instanceTypeStore);
