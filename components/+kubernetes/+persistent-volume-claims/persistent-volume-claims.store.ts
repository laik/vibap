import {Pod} from '../+pods/pods.store';
import {ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {KubeObject} from '../../../client/kube/kube-object';
import {ObjectStore} from '../../../client/object.store';
import {classbind} from '../../../client/utils';
import {kubernetesApi} from '../kubernetes.api';

export interface PersistentVolumeClaimVolumeSource {
  claimName: string;
  readOnly?: boolean;
}

export interface PersistentVolumeClaimSpec {
  accessModes: string[];
  storageClassName: string;
  selector: {
    matchLabels: {
      release: string;
    };
    matchExpressions: {
      key: string; // environment,
      operator: string; // In,
      values: string[]; // [dev]
    }[];
  };
  resources: {
    requests: {
      storage: string; // 8Gi
    };
  };
}

@classbind()
export class PersistentVolumeClaim extends KubeObject {
  static kind = 'PersistentVolumeClaim';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  spec: PersistentVolumeClaimSpec;
  status: {
    phase: string; // Pending
  };

  getPods(allPods: Pod[]): Pod[] {
    const pods = allPods.filter(pod => pod.getNs() === this.getNs());
    return pods.filter(pod => {
      return (
        pod
          .getVolumes()
          .filter(
            volume =>
              volume.persistentVolumeClaim &&
              volume.persistentVolumeClaim.claimName === this.getName()
          ).length > 0
      );
    });
  }

  getStorage(): string {
    if (!this.spec.resources || !this.spec.resources.requests) return '-';
    return this.spec.resources.requests.storage;
  }

  getMatchLabels(): string[] {
    if (!this.spec.selector || !this.spec.selector.matchLabels) return [];
    return Object.entries(this.spec.selector.matchLabels).map(
      ([name, val]) => `${name}:${val}`
    );
  }

  getMatchExpressions() {
    if (!this.spec.selector || !this.spec.selector.matchExpressions) return [];
    return this.spec.selector.matchExpressions;
  }

  getStatus(): string {
    if (this.status) return this.status.phase;
    return '-';
  }
}

export const persistentVolumeClaimApi = new ObjectApi({
  kind: PersistentVolumeClaim.kind,
  isNamespaced: true,
  apiBase: '/api/v1/persistentvolumeclaims',
  objectConstructor: PersistentVolumeClaim,
  request: kubernetesApi,
});

export class PersistentVolumeClaimStore extends ObjectStore<PersistentVolumeClaim> {
  api = persistentVolumeClaimApi;
}

export const persistentVolumeClaimStore = new PersistentVolumeClaimStore();

apiManager.registerStore(persistentVolumeClaimApi, persistentVolumeClaimStore);
