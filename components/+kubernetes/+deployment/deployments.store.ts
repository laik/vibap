import { ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { KubeObject } from '../../../client/kube/kube-object';
import { IAffinity } from '../../../client/kube/workload-kube-object';
import { ObjectStore } from '../../../client/object.store';
import { classbind } from '../../../client/utils';
import { kubernetesApi } from '../kubernetes.api';

@classbind()
export class Deployment extends KubeObject {
  static kind = 'Deployment';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  spec: {
    replicas: number;
    selector: {matchLabels: {[app: string]: string}};
    template: {
      metadata: {
        creationTimestamp?: string;
        labels: {[app: string]: string};
      };
      spec: {
        containers: {
          name: string;
          image: string;
          args?: string[];
          ports?: {
            name: string;
            containerPort: number;
            protocol: string;
          }[];
          env?: {
            name: string;
            value: string;
          }[];
          resources: {
            limits?: {
              cpu: string;
              memory: string;
            };
            requests: {
              cpu: string;
              memory: string;
            };
          };
          volumeMounts?: {
            name: string;
            mountPath: string;
          }[];
          livenessProbe?: {
            httpGet: {
              path: string;
              port: number;
              scheme: string;
            };
            initialDelaySeconds: number;
            timeoutSeconds: number;
            periodSeconds: number;
            successThreshold: number;
            failureThreshold: number;
          };
          readinessProbe?: {
            httpGet: {
              path: string;
              port: number;
              scheme: string;
            };
            initialDelaySeconds: number;
            timeoutSeconds: number;
            periodSeconds: number;
            successThreshold: number;
            failureThreshold: number;
          };
          terminationMessagePath: string;
          terminationMessagePolicy: string;
          imagePullPolicy: string;
        }[];
        restartPolicy: string;
        terminationGracePeriodSeconds: number;
        dnsPolicy: string;
        affinity?: IAffinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        serviceAccountName: string;
        serviceAccount: string;
        securityContext: {};
        schedulerName: string;
        tolerations?: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
        volumes?: {
          name: string;
          configMap: {
            name: string;
            defaultMode: number;
            optional: boolean;
          };
        }[];
      };
    };
    strategy: {
      type: string;
      rollingUpdate: {
        maxUnavailable: number;
        maxSurge: number;
      };
    };
  };
  status: {
    observedGeneration: number;
    replicas: number;
    updatedReplicas: number;
    readyReplicas: number;
    availableReplicas?: number;
    unavailableReplicas?: number;
    conditions: {
      type: string;
      status: string;
      lastUpdateTime: string;
      lastTransitionTime: string;
      reason: string;
      message: string;
    }[];
  };

  getConditions(activeOnly = false) {
    const {conditions} = this.status;
    if (!conditions) return [];
    if (activeOnly) {
      return conditions.filter(c => c.status === 'True');
    }
    return conditions;
  }

  getConditionsText(activeOnly = true) {
    return this.getConditions(activeOnly)
      .map(({type}) => type)
      .join(' ');
  }

  getReplicas() {
    return this.spec.replicas || 0;
  }

  getReadyReplicas() {
    return this.status.readyReplicas || 0;
  }
}

export const deploymentApi = new ObjectApi({
  kind: Deployment.kind,
  isNamespaced: true,
  apiBase: '/apis/apps/v1/deployments',
  objectConstructor: Deployment,
  request: kubernetesApi,
});

export class DeploymentStore extends ObjectStore<Deployment> {
  api = deploymentApi;
}

export const deploymentStore = new DeploymentStore();

apiManager.registerStore(deploymentApi, deploymentStore);
