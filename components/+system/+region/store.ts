import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { systemApi } from '../system.api';

export class Region extends CloudObject {
  static kind = 'Region';

  spec: {
    local_name: string;
    id: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const regionApi = new ObjectApi({
  kind: Region.kind,
  isNamespaced: false,
  apiBase: '/apis/system.ddx2x.nip/v1/region',
  objectConstructor: Region,
  request: systemApi,
});

export class RegionStore extends ObjectStore<Region> {
  api = regionApi;

  constructor() {
    super();
  }

  getByProvider(provider: string): string[] {
    if (!this.isLoaded) {
      this.loadAll();
    }
    return this.getAllByNs(provider).map(region => region.getName());
  }
}

export const regionStore = new RegionStore();

apiManager.registerStore(regionApi, regionStore);
