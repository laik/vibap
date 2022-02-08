import {CloudObject, ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {ObjectStore} from '../../../client/object.store';
import {systemApi} from '../system.api';

export class License extends CloudObject {
  static kind = 'License';

  spec: {
    vendor: string;
    region: string;
    available_zone: string;
    ssh_type: string;
    key: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const licenseApi = new ObjectApi({
  kind: License.kind,
  isNamespaced: true,
  apiBase: '/apis/system.laik.fm/v1/license',
  objectConstructor: License,
  request: systemApi,
});

export class LicenseStore extends ObjectStore<License> {
  api = licenseApi;

  constructor() {
    super();
  }
}

export const licenseStore = new LicenseStore();

apiManager.registerStore(licenseApi, licenseStore);
