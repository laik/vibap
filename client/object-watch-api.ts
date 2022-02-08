import { computed, observable, reaction } from 'mobx';
import { stringify } from 'querystring';
import { JsonApiData, ObjectStore } from '.';
import { apiManager } from './api-manager';
import { EventSourcePolyfill as EventSource } from './eventsource/eventsource';
import { IObjectApiQueryParams, ObjectApi } from './object-api';
import { redux_update_userconfig, redux_userconfig } from './redux-store';
import { UserConfig } from './user-config';
import { classbind, EventEmitter, interval } from './utils';

export interface IWatchRouteQuery {
  api: string | string[];
}
export interface IObjectWatchEvent<T = any> {
  type: 'ADDED' | 'MODIFIED' | 'DELETED';
  object?: T;
  store?: ObjectStore;
}
export interface IObjectWatchRouteEvent {
  type: string;
  url: string;
  userConfig: UserConfig;
  status: number;
}

export type EventCallback = (evt: IObjectWatchEvent) => void;

@classbind()
export class ObjectWatchApi {
  protected evtSource: EventSource;
  protected onData = new EventEmitter<[IObjectWatchEvent]>();
  protected subscribers = observable.map<ObjectApi, number>();
  protected reconnectInterval = interval(60 * 5, this.reconnect); // background reconnect every 5min
  protected reconnectTimeoutMs = 5000;
  protected maxReconnectsOnError = 10;
  protected reconnectAttempts = this.maxReconnectsOnError;
  protected apiUrl = '/watch';
  protected cloudPlatform = true;

  constructor() {
    reaction(
      () => this.activeApis,
      () => this.connect(),
      {
        fireImmediately: true,
        delay: 1000,
      }
    );
  }

  @computed get apiURL(): string {
    return this.apiUrl;
  }

  @computed get activeApis() {
    return Array.from(this.subscribers.keys());
  }

  isCloudPlatformWatch(isCloudPlatform: boolean) {
    this.cloudPlatform = isCloudPlatform;
    return () => {
      this.cloudPlatform = true;
    };
  }

  getSubscribersCount(api: ObjectApi) {
    return this.subscribers.get(api) || 0;
  }

  subscribe(...apis: ObjectApi[]) {
    apis.forEach(api => {
      this.subscribers.set(api, this.getSubscribersCount(api) + 1);
    });
    return () =>
      apis.forEach(api => {
        const count = this.getSubscribersCount(api) - 1;
        if (count <= 0) this.subscribers.delete(api);
        else this.subscribers.set(api, count);
      });
  }

  protected getQuery(): Partial<IWatchRouteQuery> {
    const { clusters } = {
      clusters: [{ cluster: 'default', namespaces: [] }],
    };

    const userConfig = apiManager.userConfig;
    const allowedWs = UserConfig.getAllWs(userConfig);
    if (userConfig.roleType !== 3 && allowedWs.length == 0) {
      return {};
    }
    return {
      api: this.activeApis
        .map(api => {
          if (this.cloudPlatform) {
            // 查询云平台的数据

            if (userConfig.roleType === 3) {
              // list all tenant names and watch all tenant namespaces
              const query: IObjectApiQueryParams = {};
              return api.getWatchUrl('', query);
            }

            if (!api.isNamespaced) {
              const query: IObjectApiQueryParams = {
                tenant: userConfig.tenant
              };
              return api.getWatchUrl('', query);
            }

            const query: IObjectApiQueryParams = {
              tenant: userConfig.tenant
            };
            return UserConfig.getAllWs(userConfig)
              .map(ws => api.getWatchUrl(ws, query))
              .flat<string[]>()
              .join('&');
          } else {
            //查询kubernetes multi 的数据
            return clusters.map(item => {
              const query: IObjectApiQueryParams = { cluster: item.cluster };
              if (userConfig.isAdmin) {
                return api.getWatchUrl('', query);
              }
              return item.namespaces
                .map(ns => api.getWatchUrl(ns, query))
                .flat<string[]>()
                .join('&');
            });
          }
        })
        .flat(),
    };
  }

  protected connect() {
    if (this.evtSource) this.disconnect(); // close previous connection
    if (!this.activeApis.length) {
      return;
    }
    const query = this.getQuery();
    const apiUrl = `${this.apiURL}?${stringify(query)}`;
    const userConfig = redux_userconfig();
    const token = userConfig?.token || '';
    const tenant = userConfig?.tenant || '';
    this.evtSource = new EventSource(apiUrl, {
      headers: {
        Authorization: token,
        Tenant: tenant,
      },
    });
    this.evtSource.onmessage = this.onMessage;
    this.evtSource.onerror = this.onError;
    if (!query.api) {
      this.disconnect();
      this.reset();
      this.writeLog('NOT API REGISTERED');
      return;
    }
    this.writeLog('CONNECTING', query.api);
  }

  reconnect() {
    if (!this.evtSource || this.evtSource.readyState !== EventSource.OPEN) {
      this.reconnectAttempts = this.maxReconnectsOnError;
      this.connect();
    }
  }

  protected disconnect() {
    if (!this.evtSource) return;
    this.evtSource.close();
    this.evtSource.onmessage = null;
    this.evtSource = null;
  }

  protected onMessage(evt: MessageEvent) {
    if (!evt.data) return;
    let data = JSON.parse(evt.data);
    if (!this.onData) {
      return;
    }
    if ((data as IObjectWatchEvent).object) {
      console.log("onMessage.emit", evt);
      this.onData.emit(data);
    } else {
      if (typeof this.onRouteEvent === 'function') {
        this.onRouteEvent(data);
      }
    }
  }

  protected async onRouteEvent({ type, url, userConfig }: IObjectWatchRouteEvent) {
    if (type === 'STREAM_END') {
      this.disconnect();
      const { apiBase, namespace } = ObjectApi.parseApi(url);
      if (apiBase === '' || namespace === '') {
        return;
      }
      const api = apiManager.getApi(apiBase);
      if (api) {
        await api.refreshResourceVersion({ namespace });
        this.reconnect();
      }
    } else if (type.toLowerCase() === 'ping') {
      console.log('onMessage: PING');
    } else if (type === 'STREAM_ERROR') {
      this.disconnect();
      console.log('onMessage: STREAM_ERROR');
    } else if (type === "USER_CONFIG") {
      // 用户信息经过 watch 推流
      // console.log('onMessage: update config');
      redux_update_userconfig(userConfig)
    }
  }

  protected onError(evt: MessageEvent) {
    const { reconnectAttempts: attemptsRemain, reconnectTimeoutMs } = this;
    if (evt.eventPhase === EventSource.CLOSED) {
      if (attemptsRemain > 0) {
        this.reconnectAttempts--;
        setTimeout(() => this.connect(), reconnectTimeoutMs);
      }
    }
  }

  protected writeLog(...data: any[]) {
    console.log('%cOBJECT-WATCH-API:', `font-weight: bold`, ...data);
  }

  addListener<T extends ObjectStore>(store: T, ecb: EventCallback) {
    const listener = (evt: IObjectWatchEvent<JsonApiData>) => {
      const ver =
        evt.object.metadata?.version ||
        evt.object.metadata?.resourceVersion ||
        '';
      const ns =
        evt.object.metadata?.namespace || evt.object.metadata?.workspace || '';

      store.api.setResourceVersion(ns, ver);
      store.api.setResourceVersion('', ver);
      const evtKind = evt.object.metadata?.kind || evt.object?.kind || '';
      if (
        evtKind === store.api.apiResource ||
        store.api.kind == evt.object.kind ||
        ''
      ) {
        evt.store = store;
        ecb(evt);
      }
    };
    this.onData.addListener(listener);
    return () => {
      this.onData.removeListener(listener);
    };
  }

  reset() {
    this.subscribers.clear();
  }
}

export const objectWatchApi = new ObjectWatchApi();
