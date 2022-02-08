import {ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {KubeObject} from '../../../client/kube/kube-object';
import {ObjectStore} from '../../../client/object.store';
import {classbind} from '../../../client/utils';
import {kubernetesApi} from '../kubernetes.api';

@classbind()
export class ConfigMap extends KubeObject {
  static kind = 'ConfigMap';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
  data: {
    [param: string]: string;
  };

  getKeys(): string[] {
    if (this.data == null) {
      return [];
    }
    return Object.keys(this.data);
  }
}

export const configMapApi = new ObjectApi({
  kind: ConfigMap.kind,
  isNamespaced: true,
  apiBase: '/api/v1/configmaps',
  objectConstructor: ConfigMap,
  request: kubernetesApi,
});

export class ConfigMapStore extends ObjectStore<ConfigMap> {
  api = configMapApi;
}

export const configMapStore = new ConfigMapStore();

apiManager.registerStore(configMapApi, configMapStore);
