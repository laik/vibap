import {ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {KubeObject} from '../../../client/kube/kube-object';
import {ObjectStore} from '../../../client/object.store';
import {classbind} from '../../../client/utils';
import {kubernetesApi} from '../kubernetes.api';

export interface IServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
}

export class ServicePort implements IServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
  nodePort?: number;

  constructor(data: IServicePort) {
    Object.assign(this, data);
  }

  toString() {
    if (this.nodePort) {
      return `${this.port}:${this.nodePort}/${this.protocol}`;
    } else {
      return `${this.port}${
        this.port === this.targetPort ? '' : ':' + this.targetPort
      }/${this.protocol}`;
    }
  }
}

@classbind()
export class Service extends KubeObject {
  static kind = 'Service';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  spec: {
    type: string;
    clusterIP: string;
    externalTrafficPolicy?: string;
    loadBalancerIP?: string;
    sessionAffinity: string;
    selector: {[key: string]: string};
    ports: ServicePort[];
    externalIPs?: string[]; // https://kubernetes.io/docs/concepts/services-networking/service/#external-ips
  };

  status: {
    loadBalancer?: {
      ingress?: {
        ip?: string;
        hostname?: string;
      }[];
    };
  };

  getClusterIp() {
    return this.spec.clusterIP;
  }

  getExternalIps() {
    const lb = this.getLoadBalancer();
    if (lb && lb.ingress) {
      return lb.ingress.map(val => val.ip || val.hostname);
    }
    return this.spec.externalIPs || [];
  }

  getType() {
    return this.spec.type || '-';
  }

  getSelector(): string[] {
    if (!this.spec.selector) return [];
    return Object.entries(this.spec.selector).map(val => val.join('='));
  }

  getPorts(): ServicePort[] {
    const ports = this.spec.ports || [];
    return ports.map(p => new ServicePort(p));
  }

  getLoadBalancer() {
    return this.status.loadBalancer;
  }

  isActive() {
    return (
      this.getType() !== 'LoadBalancer' || this.getExternalIps().length > 0
    );
  }

  getStatus() {
    return this.isActive() ? 'Active' : 'Pending';
  }
}

export const serviceApi = new ObjectApi({
  kind: Service.kind,
  isNamespaced: true,
  apiBase: '/api/v1/services',
  objectConstructor: Service,
  request: kubernetesApi,
});

export class ServiceStore extends ObjectStore<Service> {
  api = serviceApi;
}

export const serviceStore = new ServiceStore();

apiManager.registerStore(serviceApi, serviceStore);
