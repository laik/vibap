import orderBy from 'lodash/orderBy';
import { action, computed, observable, when } from 'mobx';
import { JsonApiData } from './json-api';
import { classbind, noop } from './utils';

export interface ItemObject extends JsonApiData {
  getId?(): string;
  getName?(): string;
}

@classbind()
export abstract class ItemStore<T extends ItemObject = ItemObject> {
  abstract loadAll(): Promise<void>;

  protected defaultSorting = (item: T) => {
    let ele: any = item;
    if (ele?.metadata?.version !== undefined) {
      return item?.metadata?.version || item?.metadata?.resourceVersion;
    }
  };

  @observable protected isLoadingOb = false;
  @observable protected isLoadedOb = false;

  @observable protected itemsStore = observable.array<T>([], { deep: false });
  @observable selectedItemsIds = observable.map<string, boolean>();

  @computed get selectedItems(): T[] {
    return this.itemsStore.filter(item => this.selectedItemsIds.get(item.getId()));
  }

  @computed get isLoaded() {
    return this.isLoadedOb
  }

  @computed get isLoading(): boolean {
    return this.isLoadingOb
  }

  @computed get items(): T[] {
    return this.itemsStore
  }

  getByName(name: string, ...args: any[]): T;
  getByName(name: string): T {
    return this.itemsStore.find(item => item.getName() === name);
  }

  @action
  protected sortItems(
    items: T[] = this.itemsStore,
    sorting?: ((item: T) => any)[],
    order?: 'asc' | 'desc'
  ): T[] {
    return orderBy(items, sorting || this.defaultSorting, (order = 'desc'));
  }

  protected async createItem(...args: any[]): Promise<any>;

  @action
  protected async createItem(request: () => Promise<T>) {
    const newItem = await request();
    const item = this.itemsStore.find(item => item.getId() === newItem.getId());
    if (item) {
      return item;
    } else {
      const items = this.sortItems([...this.itemsStore, newItem]);
      this.itemsStore.replace(items);
      return newItem;
    }
  }

  protected async loadItems(...args: any[]): Promise<any>;

  @action
  protected async loadItems(
    request: () => Promise<T[] | any>,
    sortItems = true
  ) {
    if (this.isLoadingOb) {
      await when(() => !this.isLoadingOb);
      return;
    }
    this.isLoadingOb = true;
    try {
      let items = await request();
      if (sortItems) items = this.sortItems(items);
      this.itemsStore.replace(items);
      this.isLoadedOb = true;
    } finally {
      this.isLoadingOb = false;
    }
  }

  protected async loadItem(...args: any[]): Promise<T>;

  @action
  protected async loadItem(request: () => Promise<T>, sortItems = true) {
    const item = await request().catch(() => null);
    if (item) {
      const existingItem = this.itemsStore.find(el => el.getId() === item.getId());
      if (existingItem) {
        const index = this.itemsStore.findIndex(item => item === existingItem);
        this.itemsStore.splice(index, 1, item);
      } else {
        let items = [...this.itemsStore, item];
        if (sortItems) items = this.sortItems(items);
        this.itemsStore.replace(items);
      }
      return item;
    }
  }

  @action
  protected async updateItem(item: T, request: () => Promise<T>) {
    const updatedItem = await request();
    const index = this.itemsStore.findIndex(i => i.getId() === item.getId());
    this.itemsStore.splice(index, 1, updatedItem);
    return updatedItem;
  }

  @action
  protected removeItem = (removeItem: T) => {
    this.itemsStore.replace(this.itemsStore.filter(item => item.getId() !== removeItem.getId()));
  };

  isSelected(item: T) {
    return !!this.selectedItemsIds.get(item.getId());
  }

  @action
  select(item: T) {
    this.selectedItemsIds.set(item.getId(), true);
  }

  @action
  unselect(item: T) {
    this.selectedItemsIds.delete(item.getId());
  }

  @action
  toggleSelection(item: T) {
    if (this.isSelected(item)) {
      this.unselect(item);
    } else {
      this.select(item);
    }
  }

  @action
  toggleSelectionAll(visibleItems: T[] = this.itemsStore) {
    const allSelected = visibleItems.every(this.isSelected);
    if (allSelected) {
      visibleItems.forEach(this.unselect);
    } else {
      visibleItems.forEach(this.select);
    }
  }

  isSelectedAll(visibleItems: T[] = this.itemsStore) {
    if (!visibleItems.length) return false;
    return visibleItems.every(this.isSelected);
  }

  @action
  resetSelection() {
    this.selectedItemsIds.clear();
  }

  @action
  reset() {
    this.resetSelection();
    this.itemsStore.clear();
    this.selectedItemsIds.clear();
    this.isLoadedOb = false;
    this.isLoadingOb = false;
  }

  // async removeSelectedItems?(): Promise<any>;

  subscribe(...args: any[]) {
    return noop;
  }

  *[Symbol.iterator]() {
    yield* this.itemsStore;
  }
}
