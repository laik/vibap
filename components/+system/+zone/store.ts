import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { systemApi } from '../system.api';

export class Zone extends CloudObject {
  static kind = 'Zone';

  spec: {
    region: string;
    local_name: string;
    id: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const zoneApi = new ObjectApi({
  kind: Zone.kind,
  isNamespaced: false,
  apiBase: '/apis/system.ddx2x.nip/v1/availablezone',
  objectConstructor: Zone,
  request: systemApi,
});

export class ZoneStore extends ObjectStore<Zone> {
  api = zoneApi;

  constructor() {
    super();
  }

  getZoneNames(region: string): string[] {
    if (!this.isLoaded) this.loadAll();
    return this.items
      .filter(item => item.spec.region !== region)
      .map(item => item.getName())
      .flat();
  }
}

export const zoneStore = new ZoneStore();

apiManager.registerStore(zoneApi, zoneStore);
