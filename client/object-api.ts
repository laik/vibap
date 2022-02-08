import merge from 'lodash/merge';
import { stringify } from 'querystring';
import { apiManager } from './api-manager';
import { CloudObject, ICloudObjectConstructor } from './object';
import {
  ObjectJsonApi,
  ObjectJsonApiData,
  ObjectJsonApiDataList
} from './object-json-api';
import { objectWatchApi } from './object-watch-api';
import { redux_userconfig } from './redux-store';

const attachUri = '/shell/';

export interface IObjectApiOptions<T extends CloudObject> {
  kind: string; // resource type within api-group, e.g. "Namespace"
  apiBase: string; // base api-path for listing all resources, e.g. "/api/v1/pods"
  isNamespaced: boolean;
  objectConstructor?: ICloudObjectConstructor<T>;
  request?: any;
  resource?: string;
}

export interface IObjectApiQueryParams {
  watch?: boolean | number;
  resourceVersion?: string;
  timeoutSeconds?: number;
  limit?: number; // doesn't work with ?watch
  continue?: string; // might be used with ?limit from second request
  namespace?: string; // cloud platform use workspace,but provider use namespace
  cluster?: string; // multi cluster
  path?: string; // label update datastructure field
  tenant?: string; // tenant describe resource
}

export interface IObjectApiQueryParamsExtension extends IObjectApiQueryParams {
  [key: string]: any;
}

export interface IObjectApiLinkRef {
  apiPrefix?: string;
  apiVersion: string;
  resource: string;
  name: string;
  namespace?: string;
}

type CallbackVoid = () => void;
export class ObjectApi<T extends CloudObject = any> {
  static matcher =
    /(\/apis?.*?)\/(?:(.*?)\/)?(v.*?)(?:\/namespaces\/(.+?))?\/([^\/]+)(?:\/([^\/?]+))?.*$/;
  api: any;

  static parseUrl(apiPath = '') {
    if (apiPath === '') {
      throw new Error('Invalid API path');
    }
    apiPath = new URL(apiPath, location.origin).pathname;
    return ObjectApi.parseApi(apiPath);
  }

  static parseApi(apiPath = '') {
    const [, apiPrefix, apiGroup = '', apiVersion, namespace, resource, name] =
      apiPath.match(ObjectApi.matcher) || [];
    const apiVersionWithGroup = [apiGroup, apiVersion].filter(v => v).join('/');
    const apiBase = [apiPrefix, apiGroup, apiVersion, resource]
      .filter(v => v)
      .join('/');
    return {
      apiBase,
      apiPrefix,
      apiGroup,
      apiVersion,
      apiVersionWithGroup,
      namespace,
      resource,
      name,
    };
  }

  constructor(protected options: IObjectApiOptions<T>) {
    const {
      kind,
      isNamespaced = false,
      objectConstructor = CloudObject as ICloudObjectConstructor,
      request = ObjectApi,
    } = options || {};

    const {
      apiBase,
      apiPrefix,
      apiGroup,
      apiVersion,
      apiVersionWithGroup,
      namespace,
      resource,
      name,
    } = ObjectApi.parseApi(options.apiBase);

    this.kind = kind;
    this.isNamespaced = isNamespaced;
    this.apiBase = apiBase;
    this.apiPrefix = apiPrefix;
    this.apiGroup = apiGroup;
    this.apiVersion = apiVersion;
    this.apiVersionWithGroup = apiVersionWithGroup;
    this.apiResource = resource;
    this.namespace = namespace;
    this.request = request;
    this.objectConstructor = objectConstructor;

    this.parseResponse = this.parseResponse.bind(this);
    this.parseResponseNotUpdateStore = this.parseResponseNotUpdateStore.bind(this);
    apiManager.registerApi(apiBase, this);
  }

  readonly request: ObjectJsonApi;
  readonly kind: string;
  readonly apiBase: string;
  readonly apiPrefix: string;
  readonly apiGroup: string;
  readonly apiVersion: string;
  readonly apiVersionWithGroup: string;
  readonly apiResource: string;
  readonly isNamespaced: boolean;
  readonly namespace: string;

  protected resourceVersions = new Map<string, string>();
  public objectConstructor: ICloudObjectConstructor<T>;

  /**
   * Waiting for the function to be implemented
   * @returns
   */
  watch(isCloudPlatform: boolean = true): CallbackVoid[] {
    return [
      objectWatchApi.subscribe(this),
      objectWatchApi.isCloudPlatformWatch(isCloudPlatform),
    ];
  }

  getWatchUrl(namespace = '', query: IObjectApiQueryParams = {}): string {
    return this.getUrl(
      { namespace },
      {
        watch: 1,
        resourceVersion: this.getResourceVersion(namespace) || '0',
        ...query,
      }
    );
  }

  getApiResource() {
    return this.apiResource;
  }

  setResourceVersion(namespace = '', newVersion: string) {
    this.resourceVersions.set(namespace, newVersion);
  }

  getResourceVersion(namespace = '') {
    return this.resourceVersions.get(namespace);
  }

  async refreshResourceVersion(params?: { namespace: string }) {
    return this.list(params, { limit: 1 });
  }

  static watchAll(...apis: ObjectApi[]) {
    const disposers = apis.map(api => api.watch());
    return () =>
      disposers.forEach(unwatchs => unwatchs.forEach(unwatch => unwatch()));
  }

  static createLink(ref: IObjectApiLinkRef): string {
    const { apiPrefix = '/apis', resource, apiVersion, name } = ref;
    let { namespace } = ref;
    if (namespace) {
      namespace = `namespaces/${namespace}`;
    }
    return [apiPrefix, apiVersion, namespace, resource, name]
      .filter(v => !!v)
      .join('/');
  }

  getUrl(
    { name = '', namespace = '' } = {},
    query?: Partial<IObjectApiQueryParams>,
    op?: string
  ) {
    const { apiPrefix, apiVersionWithGroup, apiResource } = this;
    const resourcePath = ObjectApi.createLink({
      apiPrefix: apiPrefix,
      apiVersion: apiVersionWithGroup,
      resource: apiResource,
      namespace: this.isNamespaced ? namespace : undefined,
      name: name,
    });
    if (this.isNamespaced) {
      const userConfig = redux_userconfig();
      query = merge({ tenant: userConfig?.tenant || '' }, query);
    }
    op = op ? '/op/' + op : ''
    return resourcePath + op + (query ? `?` + stringify(query) : '');
  }

  parseResponse(
    data: ObjectJsonApiData | ObjectJsonApiData[] | ObjectJsonApiDataList
  ): any {
    const CloudObjectConstructor = this.objectConstructor;

    if (CloudObject.isJsonApiData(data)) {
      return new CloudObjectConstructor(data);
    } else if (CloudObject.isJsonApiDataList(data)) {// process items list response
      const { items } = data;
      const { namespace, workspace, version, resourceVersion } = data.metadata;
      this.setResourceVersion('', version || resourceVersion);
      this.setResourceVersion(namespace || workspace, version || resourceVersion);
      return items.map(item => new CloudObjectConstructor({ ...item }));
    }
    else if (Array.isArray(data)) {// custom apis might return array for list response, e.g. users, groups, etc.
      return data.map(data => new CloudObjectConstructor(data));
    } else if (JSON.stringify(data).includes('Items')) {
      return [];
    }
    return data;
  }

  parseResponseNotUpdateStore(
    data: ObjectJsonApiData | ObjectJsonApiData[] | ObjectJsonApiDataList
  ): any {
    const CloudObjectConstructor = this.objectConstructor;

    if (CloudObject.isJsonApiData(data)) {
      return new CloudObjectConstructor(data);
    } else if (CloudObject.isJsonApiDataList(data)) {// process items list response
      const { items } = data;
      return items.map(item => new CloudObjectConstructor({ ...item }));
    }
    else if (Array.isArray(data)) {// custom apis might return array for list response, e.g. users, groups, etc.
      return data.map(data => new CloudObjectConstructor(data));
    } else if (JSON.stringify(data).includes('Items')) {
      return [];
    }
    return data;
  }

  query = async (
    params: {} = { namespace: '', name: '' },
    query?: IObjectApiQueryParamsExtension,
    op?: string,
  ) => {
    return await this.request
      .get(this.getUrl(params, query, op))
      .then(this.parseResponseNotUpdateStore) as T[];
  }

  queryOne = async (
    params: {} = { namespace: '', name: '' },
    query?: IObjectApiQueryParamsExtension,
    op?: string,
  ) => {
    const r = await this.query(params, query, op);
    return r.length && r[0] ? r[0] : undefined;
  }

  async list(
    { namespace = '' } = {},
    query?: IObjectApiQueryParams,
    op?: string,
  ): Promise<T[]> {
    return this.request
      .get(this.getUrl({ namespace }), { query }, op)
      .then(this.parseResponse);
  }

  async get(
    { name = '', namespace = '' } = {},
    query?: IObjectApiQueryParams,
    op?: string,
  ): Promise<T> {
    return this.request
      .get(this.getUrl({ namespace, name }), { query }, op)
      .then(this.parseResponse);
  }

  async create(
    { name = '', namespace = '', labels = {} } = {},
    data?: Partial<T>,
    query?: IObjectApiQueryParams,
    op?: string,
  ): Promise<T> {
    const apiUrl = this.getUrl({ namespace }, query, op);
    return this.request
      .post(apiUrl, {
        data: merge(
          data,
          {
            metadata: {
              name: name,
              namespace: namespace,
              labels: labels,
            },
          },
        ),
      })
      .then(this.parseResponse);
  }

  async update(
    { name = '', namespace = '' } = {},
    data?: Partial<T>,
    query?: IObjectApiQueryParams,
    op?: string,
  ): Promise<T> {
    const apiUrl = this.getUrl({ namespace, name }, query, op);
    return this.request.put(apiUrl, { data }).then(this.parseResponse);
  }

  async delete({ name = '', namespace = '' } = {}, query?: IObjectApiQueryParams): Promise<T> {
    const apiUrl = this.getUrl({ namespace, name }, query);
    return this.request.del(apiUrl, {}).then(this.parseResponse);
  }

  async upload<D = string | ArrayBuffer>(data: D) {
    const apiUrl = this.getUrl({}, {}, 'upload');
    return this.request.post(apiUrl, { data }).then(this.parseResponse);
  }

  getPodSessionUrl({
    namespace = '',
    pod = '',
    container = '',
    shellType = '',
    cluster = '',
  }) {
    if (namespace) {
      namespace = `namespace/${namespace}`;
    }
    if (pod) {
      pod = `pod/${pod}`;
    }
    if (container) {
      container = `container/${container}`;
    }
    return (
      attachUri +
      [namespace, pod, container, shellType, cluster].filter(v => !!v).join('/')
    );
  }
}
