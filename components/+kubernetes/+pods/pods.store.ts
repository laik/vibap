import {ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {KubeObject} from '../../../client/kube/kube-object';
import {IAffinity} from '../../../client/kube/workload-kube-object';
import {ObjectStore} from '../../../client/object.store';
import {classbind} from '../../../client/utils';
import {kubernetesApi} from '../kubernetes.api';

export interface TerminalSession {
  op: number;
  sessionId: string;
}

export interface IMetrics {}

export interface IPodMetrics<T = IMetrics> {
  [metric: string]: T;

  cpuUsage: T;
  cpuRequests: T;
  cpuLimits: T;
  memoryUsage: T;
  memoryRequests: T;
  memoryLimits: T;
  fsUsage: T;
  networkReceive: T;
  networkTransit: T;
}

export interface IPodLogsQuery {
  container?: string;
  tailLines?: number;
  timestamps?: boolean;
  sinceTime?: string; // Date.toISOString()-format
}

export enum PodStatus {
  TERMINATED = 'Terminated',
  FAILED = 'Failed',
  PENDING = 'Pending',
  RUNNING = 'Running',
  SUCCEEDED = 'Succeeded',
  EVICTED = 'Evicted',
}

export interface IPodContainer {
  name: string;
  image: string;
  command?: string[];
  args?: string[];
  ports: {
    name?: string;
    containerPort: number;
    protocol: string;
  }[];
  resources?: {
    limits: {
      cpu: string;
      memory: string;
    };
    requests: {
      cpu: string;
      memory: string;
    };
  };
  env?: {
    name: string;
    value?: string;
    valueFrom?: {
      fieldRef?: {
        apiVersion: string;
        fieldPath: string;
      };
      secretKeyRef?: {
        key: string;
        name: string;
      };
      configMapKeyRef?: {
        key: string;
        name: string;
      };
    };
  }[];
  envFrom?: {
    configMapRef?: {
      name: string;
    };
  }[];
  volumeMounts?: {
    name: string;
    readOnly: boolean;
    mountPath: string;
  }[];
  livenessProbe?: IContainerProbe;
  readinessProbe?: IContainerProbe;
  imagePullPolicy: string;
}

export interface IContainerProbe {
  httpGet?: {
    path?: string;
    port: number;
    scheme: string;
    host?: string;
  };
  exec?: {
    command: string[];
  };
  tcpSocket?: {
    port: number;
  };
  initialDelaySeconds?: number;
  timeoutSeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

export interface IPodContainerStatus {
  name: string;
  state: {
    [index: string]: object;
    running?: {
      startedAt: string;
    };
    waiting?: {
      reason: string;
      message: string;
    };
    terminated?: {
      startedAt: string;
      finishedAt: string;
      exitCode: number;
      reason: string;
    };
  };
  lastState: {
    terminated?: {
      containerID: string;
      finishedAt: string;
      exitCode: number;
      message: string;
    };
  };
  ready: boolean;
  restartCount: number;
  image: string;
  imageID: string;
  containerID: string;
}

@classbind()
export class Pod extends KubeObject {
  static kind = 'Pod';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  spec: {
    volumes?: {
      name: string;
      persistentVolumeClaim: {
        claimName: string;
      };
      secret: {
        secretName: string;
        defaultMode: number;
      };
    }[];
    initContainers: IPodContainer[];
    containers: IPodContainer[];
    restartPolicy: string;
    terminationGracePeriodSeconds: number;
    dnsPolicy: string;
    serviceAccountName: string;
    serviceAccount: string;
    priority: number;
    priorityClassName: string;
    nodeName: string;
    nodeSelector?: {
      [selector: string]: string;
    };
    securityContext: {};
    schedulerName: string;
    tolerations: {
      key: string;
      operator: string;
      effect: string;
      tolerationSeconds: number;
    }[];
    affinity: IAffinity;
  };
  status: {
    phase: string;
    conditions: {
      type: string;
      status: string;
      lastProbeTime: number;
      lastTransitionTime: string;
    }[];
    hostIP: string;
    podIP: string;
    startTime: string;
    initContainerStatuses?: IPodContainerStatus[];
    containerStatuses?: IPodContainerStatus[];
    qosClass: string;
    reason?: string;
  };

  getInitContainers() {
    return this.spec.initContainers || [];
  }

  getContainers() {
    return this.spec.containers || [];
  }

  getAllContainers() {
    return this.getContainers().concat(this.getInitContainers());
  }

  getRunningContainers() {
    const statuses = this.getContainerStatuses();
    return this.getAllContainers().filter(container => {
      return statuses.find(
        status => status.name === container.name && !!status.state['running']
      );
    });
  }

  getContainerStatuses(includeInitContainers = true) {
    const statuses: IPodContainerStatus[] = [];
    const {containerStatuses, initContainerStatuses} = this.status;
    if (containerStatuses) {
      statuses.push(...containerStatuses);
    }
    if (includeInitContainers && initContainerStatuses) {
      statuses.push(...initContainerStatuses);
    }
    return statuses;
  }

  getRestartsCount(): number {
    const {containerStatuses} = this.status;
    if (!containerStatuses) return 0;
    return containerStatuses.reduce(
      (count, item) => count + item.restartCount,
      0
    );
  }

  getQosClass() {
    return this.status.qosClass || '';
  }

  getReason() {
    return this.status.reason || '';
  }

  getPriorityClassName() {
    return this.spec.priorityClassName || '';
  }

  // Returns one of 5 statuses: Running, Succeeded, Pending, Failed, Evicted
  getStatus() {
    const phase = this.getStatusPhase();
    const reason = this.getReason();
    const goodConditions = ['Initialized', 'Ready'].every(
      condition =>
        !!this.getConditions().find(
          item => item.type === condition && item.status === 'True'
        )
    );
    if (reason === PodStatus.EVICTED) {
      return PodStatus.EVICTED;
    }
    if (phase === PodStatus.FAILED) {
      return PodStatus.FAILED;
    }
    if (phase === PodStatus.SUCCEEDED) {
      return PodStatus.SUCCEEDED;
    }
    if (phase === PodStatus.RUNNING && goodConditions) {
      return PodStatus.RUNNING;
    }
    return PodStatus.PENDING;
  }

  // Returns pod phase or container error if occured
  getStatusMessage(tips?: boolean) {
    let result = '';
    let tipsMessage = '';
    const statuses = this.getContainerStatuses(false); // not including initContainers
    if (statuses.length) {
      statuses.forEach(status => {
        const {state, lastState} = status;
        if (state.waiting) {
          const {reason, message} = state.waiting;
          result = reason ? reason : 'Waiting';
        }
        if (state.terminated) {
          const {reason} = state.terminated;
          result = reason ? reason : 'Terminated';
        }

        if (lastState.terminated) {
          const {message} = lastState.terminated;
          tipsMessage = message;
        }
      });
    }

    if (this.getReason() === PodStatus.EVICTED) {
      result = 'Evicted';
    }
    if (!result) {
      result = this.getStatusPhase();
    }
    if (tips) {
      let b = {} as any;
      b.reason = result;
      b.message = tipsMessage;
      return b;
    }
    return result;
  }

  getStatusPhase() {
    return this.status.phase;
  }

  getConditions() {
    return this.status.conditions || [];
  }

  getVolumes() {
    return this.spec.volumes || [];
  }

  getSecrets(): string[] {
    return this.getVolumes()
      .filter(vol => vol.secret)
      .map(vol => vol.secret.secretName);
  }

  getNodeSelectors(): string[] {
    const {nodeSelector} = this.spec;
    if (!nodeSelector) return [];
    return Object.entries(nodeSelector).map(values => values.join(': '));
  }

  getTolerations() {
    return this.spec.tolerations || [];
  }

  getAffinity(): IAffinity {
    return this.spec.affinity;
  }

  hasIssues() {
    const notReady = !!this.getConditions().find(condition => {
      return condition.type == 'Ready' && condition.status !== 'True';
    });
    const crashLoop = !!this.getContainerStatuses().find(condition => {
      const waiting = condition.state.waiting;
      return waiting && waiting.reason == 'CrashLoopBackOff';
    });
    return notReady || crashLoop || this.getStatusPhase() !== 'Running';
  }

  getLivenessProbe(container: IPodContainer) {
    return this.getProbe(container.livenessProbe);
  }

  getReadinessProbe(container: IPodContainer) {
    return this.getProbe(container.readinessProbe);
  }

  getProbe(probeData: IContainerProbe) {
    if (!probeData) return [];
    const {
      httpGet,
      exec,
      tcpSocket,
      initialDelaySeconds,
      timeoutSeconds,
      periodSeconds,
      successThreshold,
      failureThreshold,
    } = probeData;
    const probe = [];
    // HTTP Request
    if (httpGet) {
      const {path, port, host, scheme} = httpGet;
      probe.push(
        'http-get',
        `${scheme.toLowerCase()}://${host || ''}:${port || ''}${path || ''}`
      );
    }
    // Command
    if (exec && exec.command) {
      probe.push(`exec [${exec.command.join(' ')}]`);
    }
    // TCP Probe
    if (tcpSocket && tcpSocket.port) {
      probe.push(`tcp-socket :${tcpSocket.port}`);
    }
    probe.push(
      `delay=${initialDelaySeconds || '0'}s`,
      `timeout=${timeoutSeconds || '0'}s`,
      `period=${periodSeconds || '0'}s`,
      `#success=${successThreshold || '0'}`,
      `#failure=${failureThreshold || '0'}`
    );
    return probe;
  }

  getNodeName() {
    return this.spec?.nodeName;
  }
}

export interface TerminalSession {
  op: number;
  sessionId: string;
}

export class PodsApi extends ObjectApi<Pod> {
  async getTerminalSession(params: {
    namespace: string;
    pod: string;
    container: string;
    shellType: string;
    cluster: string;
  }): Promise<TerminalSession> {
    const path = this.getPodSessionUrl(params);
    return this.request.get(path);
  }
}

export const podApi = new PodsApi({
  kind: Pod.kind,
  isNamespaced: true,
  apiBase: '/api/v1/pods',
  objectConstructor: Pod,
  request: kubernetesApi,
});

export class PodStore extends ObjectStore<Pod> {
  api = podApi;
}

export const podStore = new PodStore();

apiManager.registerStore(podApi, podStore);
