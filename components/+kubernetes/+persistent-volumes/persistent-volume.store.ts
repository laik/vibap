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
export class PersistentVolume extends KubeObject {
  static kind = 'PersistentVolume';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  spec: {
    capacity: {
      storage: string; // 8Gi
    };
    flexVolume: {
      driver: string; // ceph.rook.io/rook-ceph-system,
      options: {
        clusterNamespace: string; // rook-ceph,
        image: string; // pvc-c5d7c485-9f1b-11e8-b0ea-9600000e54fb,
        pool: string; // replicapool,
        storageClass: string; // rook-ceph-block
      };
    };
    mountOptions?: string[];
    accessModes: string[]; // [ReadWriteOnce]
    claimRef: {
      kind: string; // PersistentVolumeClaim,
      namespace: string; // storage,
      name: string; // nfs-provisioner,
      uid: string; // c5d7c485-9f1b-11e8-b0ea-9600000e54fb,
      apiVersion: string; // v1,
      resourceVersion: string; // 292180
    };
    persistentVolumeReclaimPolicy: string; // Delete,
    storageClassName: string; // rook-ceph-block
    nfs?: {
      path: string;
      server: string;
    };
  };

  status: {
    phase: string;
    reason?: string;
  };

  getCapacity(inBytes = false) {
    const capacity = this.spec.capacity;
    if (capacity) {
      if (inBytes) return unitsToBytes(capacity.storage);
      return capacity.storage;
    }
    return 0;
  }

  getStatus() {
    if (!this.status) return;
    return this.status.phase || '-';
  }

  getClaimRefName() {
    const {claimRef} = this.spec;
    return claimRef ? claimRef.name : '';
  }
}

export const persistentVolumeApi = new ObjectApi({
  kind: PersistentVolume.kind,
  isNamespaced: true,
  apiBase: '/api/v1/persistentvolumes',
  objectConstructor: PersistentVolume,
  request: kubernetesApi,
});

export class PersistentVolumeStore extends ObjectStore<PersistentVolume> {
  api = persistentVolumeApi;
}

export const persistentVolumeStore = new PersistentVolumeStore();

apiManager.registerStore(persistentVolumeApi, persistentVolumeStore);
