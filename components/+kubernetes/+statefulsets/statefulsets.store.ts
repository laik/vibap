import {IPodContainer} from '../+pods/pods.store';
import {ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {KubeObject} from '../../../client/kube/kube-object';
import {IAffinity} from '../../../client/kube/workload-kube-object';
import {ObjectStore} from '../../../client/object.store';
import {classbind} from '../../../client/utils';
import {kubernetesApi} from '../kubernetes.api';
import get from 'lodash/get';

@classbind()
export class StatefulSet extends KubeObject {
  static kind = 'StatefulSet';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  spec: {
    serviceName: string;
    replicas: number;
    selector: {
      matchLabels: {
        [key: string]: string;
      };
    };
    template: {
      metadata: {
        labels: {
          app: string;
        };
      };
      spec: {
        containers: {
          name: string;
          image: string;
          ports: {
            containerPort: number;
            name: string;
          }[];
          volumeMounts: {
            name: string;
            mountPath: string;
          }[];
        }[];
        affinity?: IAffinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        tolerations: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
      };
    };
    volumeClaimTemplates: {
      metadata: {
        name: string;
      };
      spec: {
        accessModes: string[];
        resources: {
          requests: {
            storage: string;
          };
        };
      };
    }[];
  };
  status: {
    observedGeneration: number;
    replicas: number;
    currentReplicas: number;
    currentRevision: string;
    updateRevision: string;
    collisionCount: number;
  };

  getImages() {
    const containers: IPodContainer[] = get(
      this,
      'spec.template.spec.containers',
      []
    );
    return [...containers].map(container => container.image);
  }

  getReplica() {
    return this.spec.replicas || 0;
  }
}

export const statefulsetApi = new ObjectApi({
  kind: StatefulSet.kind,
  isNamespaced: true,
  apiBase: '/api/v1/statefulsets',
  objectConstructor: StatefulSet,
  request: kubernetesApi,
});

export class StatefulSetStore extends ObjectStore<StatefulSet> {
  api = statefulsetApi;
}

export const statefulSetStore = new StatefulSetStore();

apiManager.registerStore(statefulsetApi, statefulSetStore);
