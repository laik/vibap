import {ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {KubeObject} from '../../../client/kube/kube-object';
import {ObjectStore} from '../../../client/object.store';
import {classbind} from '../../../client/utils';
import {kubernetesApi} from '../kubernetes.api';

@classbind()
export class Ingress extends KubeObject {
  static kind = 'Ingress';

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  spec: {
    tls: {
      hosts: string[];
      secretName: string;
    }[];
    rules?: {
      host?: string;
      http: {
        paths: {
          path?: string;
          backend: {
            serviceName: string;
            servicePort: number;
          };
        }[];
      };
    }[];
    backend?: {
      serviceName: string;
      servicePort: number;
    };
  };
  status: {
    loadBalancer: {
      ingress: any[];
    };
  };

  getRoutes() {
    const {
      spec: {tls, rules},
    } = this;
    if (!rules) return [];

    let protocol = 'http';
    const routes: string[] = [];
    if (tls && tls.length > 0) {
      protocol += 's';
    }
    rules.map(rule => {
      const host = rule.host ? rule.host : '*';
      if (rule.http && rule.http.paths) {
        rule.http.paths.forEach(path => {
          routes.push(
            protocol +
              '://' +
              host +
              (path.path || '/') +
              ' ⇢ ' +
              path.backend.serviceName +
              ':' +
              path.backend.servicePort
          );
        });
      }
    });

    return routes;
  }

  getHosts() {
    const {
      spec: {rules},
    } = this;
    if (!rules) return [];
    return rules.filter(rule => rule.host).map(rule => rule.host);
  }

  getPorts() {
    const ports: number[] = [];
    const {
      spec: {tls, rules, backend},
    } = this;
    const httpPort = 80;
    const tlsPort = 443;
    if (rules && rules.length > 0) {
      if (rules.some(rule => rule.hasOwnProperty('http'))) {
        ports.push(httpPort);
      }
    } else {
      if (backend && backend.servicePort) {
        ports.push(backend.servicePort);
      }
    }
    if (tls && tls.length > 0) {
      ports.push(tlsPort);
    }
    return ports.join(', ');
  }
}

export const ingressApi = new ObjectApi({
  kind: Ingress.kind,
  isNamespaced: true,
  apiBase: '/api/v1/ingresses',
  objectConstructor: Ingress,
  request: kubernetesApi,
});

export class IngressStore extends ObjectStore<Ingress> {
  api = ingressApi;
}

export const ingressStore = new IngressStore();

apiManager.registerStore(ingressApi, ingressStore);
