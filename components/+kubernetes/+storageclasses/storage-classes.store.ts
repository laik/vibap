import {Pod} from '../+pods/pods.store';
import {ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {KubeObject} from '../../../client/kube/kube-object';
import {IAffinity} from '../../../client/kube/workload-kube-object';
import {ObjectStore} from '../../../client/object.store';
import {classbind} from '../../../client/utils';
import {unitsToBytes} from '../../../client/utils/convertMemory';
import {kubernetesApi} from '../kubernetes.api';

@classbind()
export class StorageClasses extends KubeObject {
  static kind = 'StorageClasses';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  provisioner: string; // e.g. "storage.k8s.io/v1"
  mountOptions?: string[];
  volumeBindingMode: string;
  reclaimPolicy: string;
  parameters: {
    [param: string]: string; // every provisioner has own set of these parameters
  };

  isDefault() {
    const annotations = this.metadata.annotations || {};
    return (
      annotations['storageclass.kubernetes.io/is-default-class'] === 'true' ||
      annotations['storageclass.beta.kubernetes.io/is-default-class'] === 'true'
    );
  }

  getVolumeBindingMode() {
    return this.volumeBindingMode || '-';
  }

  getReclaimPolicy() {
    return this.reclaimPolicy || '-';
  }
}

export const storageClassesApi = new ObjectApi({
  kind: StorageClasses.kind,
  isNamespaced: true,
  apiBase: '/api/v1/storageclasses',
  objectConstructor: StorageClasses,
  request: kubernetesApi,
});

export class StorageClassesStore extends ObjectStore<StorageClasses> {
  api = storageClassesApi;
}

export const storageClassesStore = new StorageClassesStore();

apiManager.registerStore(storageClassesApi, storageClassesStore);
