import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { systemApi } from '../system.api';

export class Cluster extends CloudObject {
  static kind = 'Cluster';

  spec: {
    provider: string;
    region: string;
    az: string;
    config: {};
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const clusterApi = new ObjectApi({
  kind: Cluster.kind,
  isNamespaced: false,
  apiBase: '/apis/system.ddx2x.nip/v1/cluster',
  objectConstructor: Cluster,
  request: systemApi,
});

export class ClusterStore extends ObjectStore<Cluster> {
  api = clusterApi;
}

export const clusterStore = new ClusterStore();

apiManager.registerStore(clusterApi, clusterStore);
