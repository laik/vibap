// Base http-service / json-api class
import { merge } from 'lodash';
import { RequestInit, Response } from 'node-fetch';
import { stringify } from 'querystring';
import { onApiError } from './index';
import { redux_userconfig } from './redux-store';
import { cancelableFetch } from './utils';
import { EventEmitter } from './utils/eventEmitter';

export interface JsonApiData {
  kind?: string; // kubernetes kind
  apiVersion?: string; // kubenetes apiversion
  metadata?: {
    kind?: string;
    uid?: string; // kubenetes use uid
    uuid?: string; // hybrid cloud use uuid
    name: string;
    namespace?: string;
    workspace?: string;
    resourceVersion?: string; // kubenetes use resourceVersion
    version?: string; // hybrid cloud use version
  };
}

export interface JsonApiError {
  code?: number;
  message?: string;
  errors?: { id: string; title: string; status?: number }[];
}

export interface JsonApiParams<D = any> {
  query?: { [param: string]: string | number | any };
  data?: D; // request body
}

export interface JsonApiLog {
  method: string;
  reqUrl: string;
  reqInit: RequestInit;
  data?: any;
  error?: any;
}

export interface JsonApiConfig {
  apiPrefix: string;
  debug?: boolean;
}

export class JsonApi<D = JsonApiData, P extends JsonApiParams = JsonApiParams> {
  static reqInitDefault: RequestInit = {
    headers: {
      'content-type': 'application/json',
    },
  };

  static configDefault: Partial<JsonApiConfig> = {
    debug: false,
  };

  constructor(
    protected config: JsonApiConfig,
    protected reqInit?: RequestInit
  ) {
    this.config = Object.assign({}, JsonApi.configDefault, config);
    this.reqInit = Object.assign({}, JsonApi.reqInitDefault, reqInit);
    this.parseResponse = this.parseResponse.bind(this);
    this.onError.addListener(onApiError);
  }

  public onData = new EventEmitter<[D, Response]>();
  public onError = new EventEmitter<[JsonApiErrorParsed, Response]>();

  get<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = redux_userconfig();
    const token = userConfig?.token || '';
    const tenant = userConfig?.tenant || '';
    let reqConfig = {
      ...reqInit,
      method: 'get',
      headers: { Authorization: token, Tenant: tenant},
    };
    return this.request<T>(path, params, { ...reqConfig });
  }

  post<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = redux_userconfig();
    const token = userConfig?.token || '';
    const tenant = userConfig?.tenant || '';
    let reqConfig = {
      ...reqInit,
      method: 'post',
      headers: { Authorization: token, Tenant: tenant},
    };
    return this.request<T>(path, params, { ...reqConfig });
  }

  put<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = redux_userconfig();
    const token = userConfig?.token || '';
    const tenant = userConfig?.tenant || '';
    let reqConfig = {
      ...reqInit,
      method: 'put',
      headers: { Authorization: token, Tenant: tenant},
    };
    return this.request<T>(path, params, { ...reqConfig });
  }

  patch<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = redux_userconfig();
    const token = userConfig?.token || '';
    const tenant = userConfig?.tenant || '';
    let reqConfig = {
      ...reqInit,
      // method: 'patch',
      method: 'PATCH',
      headers: { Authorization: token, Tenant: tenant},
    };
    return this.request<T>(path, params, { ...reqConfig });
  }

  del<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    const userConfig = redux_userconfig();
    const token = userConfig?.token || '';
    const tenant = userConfig?.tenant || '';
    let reqConfig = {
      ...reqInit,
      method: 'delete',
      headers: { Authorization: token, Tenant: tenant},
    };
    return this.request<T>(path, params, { ...reqConfig });
  }

  protected async request<D>(path: string, params?: P, init: RequestInit = {}) {
    const prefix = '/api'
    let reqUrl = `${prefix}${this.config.apiPrefix}${path}`;
    const reqInit: RequestInit = merge({}, this.reqInit, init);
    const { data, query } = params || ({} as P);

    if (data && !reqInit.body) {
      reqInit.body = JSON.stringify(data);
    }
    if (query) {
      const queryString = stringify(query);
      reqUrl += (reqUrl.includes('?') ? '&' : '?') + queryString;
    }
    const infoLog: JsonApiLog = {
      method: reqInit.method.toUpperCase(),
      reqUrl,
      reqInit,
    };
    return cancelableFetch(reqUrl, reqInit).then(res => {
      return this.parseResponse<D>(res, infoLog);
    });
  }

  protected async parseResponse<D>(res: Response, log: JsonApiLog): Promise<D> {
    const { status } = res;
    let text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : "";
    } catch (e) {
      data = text;
    }
    if (status >= 200 && status < 300) {
      if (data && data.code === 200 && data.errors) {
        return Promise.reject(data.errors);
      }
      this.onData.emit(data, res);
      this.writeLog({ ...log, data });
      return Promise.resolve(data);
    } else {
      const error = new JsonApiErrorParsed(data, this.parseError(data, res));
      this.onError.emit(error, res);
      this.writeLog({ ...log, error })
      throw error;
    }
  }

  protected parseError(error: JsonApiError | string, res: Response): string[] {
    if (typeof error === 'string') {
      return [error];
    }
    if (Array.isArray(error.errors)) {
      return error.errors.map(error => error.title);
    }
    if (error.message) {
      return [error.message];
    }
    return [res.statusText || 'Error!'];
  }


  protected writeLog(log: JsonApiLog) {
    if (!this.config.debug) return;
    const { method, reqUrl, ...params } = log;
    let textStyle = 'font-weight: bold;';
    if (params.data) textStyle += 'background: green; color: white;';
    if (params.error) textStyle += 'background: red; color: white;';
    console.log(`%c${method} ${reqUrl}`, textStyle, params);
  }
}

export class JsonApiErrorParsed {
  public isUsedForNotification = false;
  public error: JsonApiError;
  public messages: string[];

  constructor(error: JsonApiError | DOMException, messages: string[]) {
    this.error = error;
    this.messages = messages;
  }
  public get isAborted() {
    return this.error.code === DOMException.ABORT_ERR;
  }
  toString() {
    return this.messages.join("\n");
  }
}