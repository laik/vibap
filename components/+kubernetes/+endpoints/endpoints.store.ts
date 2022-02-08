import {ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {KubeObject} from '../../../client/kube/kube-object';
import {IAffinity} from '../../../client/kube/workload-kube-object';
import {ObjectStore} from '../../../client/object.store';
import {classbind} from '../../../client/utils';
import {kubernetesApi} from '../kubernetes.api';

export interface IEndpointPort {
  name?: string;
  protocol: string;
  port: number;
}

export interface IEndpointAddress {
  hostname: string;
  ip: string;
  nodeName: string;
}

export interface IEndpointSubset {
  addresses: IEndpointAddress[];
  notReadyAddresses: IEndpointAddress[];
  ports: IEndpointPort[];
}

interface ITargetRef {
  kind: string;
  namespace: string;
  name: string;
  uid: string;
  resourceVersion: string;
  apiVersion: string;
}

export class EndpointAddress implements IEndpointAddress {
  hostname: string;
  ip: string;
  nodeName: string;
  targetRef?: {
    kind: string;
    namespace: string;
    name: string;
    uid: string;
    resourceVersion: string;
  };

  constructor(data: IEndpointAddress) {
    Object.assign(this, data);
  }

  getId() {
    return this.ip;
  }

  getName() {
    return this.hostname;
  }

  getTargetRef(): ITargetRef {
    if (this.targetRef) {
      return Object.assign(this.targetRef, {apiVersion: 'v1'});
    } else {
      return null;
    }
  }
}

export class EndpointSubset implements IEndpointSubset {
  addresses: IEndpointAddress[];
  notReadyAddresses: IEndpointAddress[];
  ports: IEndpointPort[];

  constructor(data: IEndpointSubset) {
    Object.assign(this, data);
  }

  getAddresses(): EndpointAddress[] {
    const addresses = this.addresses || [];
    return addresses.map(a => new EndpointAddress(a));
  }

  getNotReadyAddresses(): EndpointAddress[] {
    const notReadyAddresses = this.notReadyAddresses || [];
    return notReadyAddresses.map(a => new EndpointAddress(a));
  }

  toString(): string {
    if (!this.addresses) {
      return '';
    }
    return this.addresses
      .map(address => {
        if (!this.ports) {
          return address.ip;
        }
        return this.ports
          .map(port => {
            return `${address.ip}:${port.port}`;
          })
          .join(', ');
      })
      .join(', ');
  }
}

@classbind()
export class Endpoints extends KubeObject {
  static kind = 'Endpoints';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  subsets: IEndpointSubset[];

  getEndpointSubsets(): EndpointSubset[] {
    const subsets = this.subsets || [];
    return subsets.map(s => new EndpointSubset(s));
  }

  toString(): string {
    if (this.subsets) {
      return this.getEndpointSubsets()
        .map(es => es.toString())
        .join(', ');
    } else {
      return '<none>';
    }
  }
}

export const endpointsApi = new ObjectApi({
  kind: Endpoints.kind,
  isNamespaced: true,
  apiBase: '/api/v1/endpoints',
  objectConstructor: Endpoints,
  request: kubernetesApi,
});

export class EndpointStore extends ObjectStore<Endpoints> {
  api = endpointsApi;
}

export const endpointStore = new EndpointStore();

apiManager.registerStore(endpointsApi, endpointStore);
