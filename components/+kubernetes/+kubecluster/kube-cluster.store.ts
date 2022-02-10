import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { kubernetesApi } from '../kubernetes.api';

export class KubeCluster extends CloudObject {
  static kind = 'KubeCluster';

  spec: {
    config: {};
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const kubeClusterApi = new ObjectApi({
  kind: KubeCluster.kind,
  isNamespaced: false,
  apiBase: '/apis/kubernetes.ddx2x.nip/v1/cluster',
  objectConstructor: KubeCluster,
  request: kubernetesApi,
});

export class KubeClusterStore extends ObjectStore<KubeCluster> {
  api = kubeClusterApi;
}

export const kubeClusterStore = new KubeClusterStore();

apiManager.registerStore(kubeClusterApi, kubeClusterStore);
