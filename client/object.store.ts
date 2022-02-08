import { merge } from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import { apiManager } from './api-manager';
import { ItemStore } from './item.store';
import { CloudObject } from './object';
import { IObjectApiQueryParams, ObjectApi } from './object-api';
import { ObjectJsonApiData } from './object-json-api';
import { IObjectWatchEvent, objectWatchApi } from './object-watch-api';
import { redux_userconfig } from './redux-store';
import { classbind } from './utils/autobind';

export interface ICloudObjectParams {
  name: string;
  namespace: string;
  labels?: {
    [label: string]: string;
  };
}

type NoopCB = () => void;

@classbind()
export abstract class ObjectStore<T extends CloudObject = any> extends ItemStore<T> {
  abstract api: ObjectApi<T>;
  public limit: number = -1;

  private defers: NoopCB[] = [];
  private userConfig = redux_userconfig();

  watch(isCloudPlatform: boolean = true) {
    this.bindWatchEventsUpdater();
    this.defers.push(
      ...[objectWatchApi.addListener(this, this.onWatchApiEvent)]
    );
    this.defers.push(...this.api.watch(isCloudPlatform));
  }

  stop() {
    this.defers.reverse().map(cb => cb());
    objectWatchApi.reset();
  }

  getAllByNs(namespace: string | string[], strict = false): T[] {
    return this.itemsStore.filter(item => item.getNs() === namespace);
  }

  getByName(name: string, namespace?: string): T {
    return this.itemsStore.find(item => {
      return (
        item.getName() === name &&
        (namespace ? item.getNs() === namespace : true)
      );
    });
  }

  getById(id: string): T {
    return this.itemsStore.find(item => item.getId() === id);
  }

  getByIds(ids: string[]): T[] {
    if (!ids || ids.length === 0) return [];
    return this.itemsStore.filter(value => ids.indexOf(value.getId()) !== -1);
  }

  getNamesByIds(ids: string[]): string[] {
    return this.getByIds(ids)
      .map(items => items.getName())
      .flat();
  }

  getIdsByNames(names: string[], namespace?: string): string[] {
    return (
      this.getAllByNs(namespace)
        .filter(item => names.indexOf(item.getName()) !== -1)
        .map(item => item.getId())
        .flat() || []
    );
  }

  getByPath(name: string, namespace?: string): T {
    return this.getByName(name, namespace);
  }

  getByLabel(labels: string[] | { [label: string]: string }): T[] {
    if (Array.isArray(labels)) {
      return this.itemsStore.filter((item: T) => {
        const itemLabels = item.getLabels();
        return labels.every(label => itemLabels.includes(label));
      });
    } else {
      return this.itemsStore.filter((item: T) => {
        const itemLabels = item.metadata.labels || {};
        return Object.entries(labels).every(
          ([key, value]) => itemLabels[key] === value
        );
      });
    }
  }

  protected async loadItems(ns?: string[], cluster: string = '', all: boolean = false): Promise<T[]> {
    const { limit } = this;
    const querys = this.querys({ limit, cluster });
    if (all || !ns) {
      return this.api.list({}, querys);
    } else {
      return Promise.all(
        ns.map(namespace => this.api.list({ namespace }), querys)
      ).then(items => items.flat());
    }
  }


  protected async loadItems2(wss?: string[]): Promise<T[]> {
    const { limit } = this;
    const querys = this.querys({ limit });
    if (!wss || !this.api.isNamespaced) {
      return this.api.list({}, querys);
    } else if (wss.length == 0) {
      return Promise.all([]);
    }
    return Promise.all(
      wss.map(
        namespace => this.api.list({ namespace }),
        querys
      )
    ).then(items => items.flat());

  }

  protected filterItemsOnLoad(items: T[]) {
    return items;
  }

  @action
  async loadAll(cloudPlatform: boolean = true) {
    this.isLoadingOb = true;
    let items: T[] = [];
    if (cloudPlatform) {
      try {
        const ws = this.userConfig.allowWorkspace || [];
        if (this.userConfig.roleType == 3) {
          items = await this.loadItems2();
        } else {
          items = await this.loadItems2(ws);
        }
        this.isLoadedOb = true;
      } catch (e) {
        console.error(e);
        this.isLoadedOb = false;
      } finally {
        if (items) {
          this.itemsStore.replace(items);
        }
      }
      this.isLoadingOb = false;
      return;
    }

    const clustersNs = apiManager.userConfig.getClustersNs();
    try {
      clustersNs.forEach(
        async cluster => {
          items.push(
            ...(await this.loadItems(
              cluster.ns,
              cluster.cluster,
              apiManager.userConfig.roleType === 3
            ))
          );
          items = this.filterItemsOnLoad(items);
        });
      this.isLoadedOb = true;
    } catch (e) {
      console.error(e);
      this.isLoadedOb = false;
    } finally {
      if (items) {
        this.itemsStore.replace(items);
      }
    }
    this.isLoadingOb = false;

  }

  protected async loadItem<P = ICloudObjectParams>(params: P): Promise<T> {
    return super.loadItems(this.api);
  }


  @computed get items(): T[] {
    const userConfig = apiManager.userConfig;
    if (!this.api.isNamespaced ||
      userConfig.defaultWorkspace === undefined ||
      userConfig.defaultWorkspace === "")
      return this.itemsStore;
    return this.itemsStore.filter(
      item => item.getWorkspace() === userConfig.defaultWorkspace
    );
  }

  @action
  async load(params: ICloudObjectParams): Promise<T> {
    const { name, namespace } = params;
    let item = this.getByName(name, namespace);
    if (!item) {
      item = await this.loadItem(params);
      const newItems = this.sortItems([...this.itemsStore, item]);
      this.itemsStore.replace(newItems);
    }
    return item;
  }

  @action
  async loadFromPath(resourcePath: string) {
    const { namespace, name } = ObjectApi.parseApi(resourcePath);
    return this.load({ name, namespace });
  }

  protected async createItem(
    params: {
      name: string;
      namespace?: string;
      labels?: [[key: string], string];
    },
    data?: Partial<T>,
    query?: IObjectApiQueryParams
  ): Promise<T> {
    return this.api.create(params, data, query);
  }

  async create(
    params: {
      name: string;
      namespace?: string;
      labels?: [[key: string], string];
    },
    data?: Partial<T>,
    query?: IObjectApiQueryParams,
  ): Promise<T> {
    const querys = this.querys(query);
    const newItem = await this.createItem(params, data, querys);
    if (this.itemsStore.findIndex(item => item?.getId() === newItem?.getId()) > 0) {
      return newItem;
    }
    const items = this.sortItems([...this.itemsStore, newItem]);
    this.itemsStore.replace(items);
    return newItem;
  }

  async apply(item: T, data?: Partial<T>, query?: IObjectApiQueryParams): Promise<T> {
    const querys = this.querys(query);
    if (
      this.itemsStore.findIndex(item => {
        item.getName() == item.getName() && item.getNs() == item.getNs();
      }) > 0
    ) {
      return this.update(item, data, querys);
    }
    return this.create({ name: item.getName(), namespace: item.getNs() }, data, querys);
  }

  protected querys(query?: IObjectApiQueryParams): IObjectApiQueryParams {
    // 数据库分库后增加查询条件（database | schmea split by tenant)
    if (this.userConfig.roleType === 3) {
      return merge({}, query);
    }
    return merge({ tenant: this.userConfig.tenant }, query);
  }

  async update(item: T, data: Partial<T>, query?: IObjectApiQueryParams): Promise<T> {
    // 从`api update`更新成功以后回写入`itemsStore item`
    const querys = this.querys(query);
    const newItem = await item.update(this, data, querys);
    const index = this.itemsStore.findIndex(
      item => item.getId() === newItem.getId()
    );
    this.itemsStore.splice(index, 1, newItem);
    return newItem;
  }

  async remove(item: { workspace: string; name: string } | T, query?: IObjectApiQueryParams): Promise<T> {
    // 从`api delete`更新成功以后移除`itemsStore item`
    let name, ns;
    if (item instanceof CloudObject) {
      name = item.getName();
      ns = item.getNs();
    } else {
      name = item.name;
      ns = item.workspace;
    }
    const querys = this.querys(query);
    const removeItem = await this.api
      .delete({name: name, namespace: ns}, querys)
      .then(item => {
        this.removeItem(item);
        return item;
      });
    return removeItem;
  }

  // collect items from watch-api events to avoid UI blowing up with huge streams of data
  protected eventsBuffer = observable<IObjectWatchEvent<ObjectJsonApiData>>(
    [],
    {
      deep: false,
    }
  );

  protected bindWatchEventsUpdater(delay = 1000) {
    return reaction(
      () => this.eventsBuffer.toJS()[0],
      this.updateFromEventsBuffer,
      {
        delay: delay,
      }
    );
  }

  subscribe(apis = [this.api]) {
    apis = apis.filter(api => (true ? api.isNamespaced : true));
    return ObjectApi.watchAll(...apis);
  }

  protected onWatchApiEvent(evt: IObjectWatchEvent) {
    if (!this.isLoaded) return;
    const { store } = evt;
    if (evt.store.api.apiResource !== this.api.apiResource) {
      throw new Error('type not supported push');
    }
    store.eventsBuffer.push(evt);
  }

  @action
  protected updateFromEventsBuffer() {
    if (!this.eventsBuffer.length) {
      return;
    }
    // create latest non-observable copy of items to apply updates in one action (==single render)
    let items = this.itemsStore.toJS();
    this.eventsBuffer.clear().forEach(({ type, object }) => {
      const { uuid, uid } = object.metadata;
      const id = uuid || uid;
      const index = items.findIndex(item => item.getId() === id);
      const item = items[index];
      switch (type) {
        case 'ADDED':
        case 'MODIFIED':
          const newItem = new this.api.objectConstructor(object);
          if (!item) {
            items.push(newItem);
          } else {
            items.splice(index, 1, newItem);
          }
          break;
        case 'DELETED':
          if (item) {
            items.splice(index, 1);
          }
          break;
      }
    });

    // slice to max allowed items
    if (this.limit && this.limit != -1 && items.length > this.limit) {
      items = items.slice(-this.limit);
    }
    // update items
    this.itemsStore.replace(this.sortItems(items));
  }
}
