import MD5 from 'crypto-js/md5';
import throttle from 'lodash/throttle';
import { action, computed, IReactionOptions, observable, reaction } from 'mobx';
import { classbind, createStorage } from '../../../client/utils';

export type TabId = string;

export enum TabKind {
  TERMINAL = 'terminal',
}

export interface IDockTab {
  id?: TabId;
  kind?: TabKind;
  title?: string;
  pinned?: boolean;
  pod?: string;
  container?: string;
}

@classbind()
export class DockStore {
  protected initialTabs: IDockTab[] = [];

  protected storage = createStorage('dock', {});
  public defaultTabId = this.initialTabs[0]?.id || '';
  public minHeight = 63;

  @observable isOpen = false;
  @observable fullSize = false;
  @observable miniSize = false;
  @observable height = this.defaultHeight;
  @observable tabs = observable.array<IDockTab>(this.initialTabs);
  @observable selectedTabId = this.defaultTabId;

  @computed get selectedTab() {
    return this.tabs.find(tab => tab.id === this.selectedTabId);
  }

  get defaultHeight() {
    if (typeof window !== 'undefined') {
      return Math.round(window.innerHeight / 2.5);
    }
    return 500;
  }

  get maxHeight() {
    const mainLayoutHeader = 45;
    return window.innerHeight - mainLayoutHeader;
  }

  constructor() {
    if (typeof window !== 'undefined') {

      // 运行实例在内存中存储, 重新刷新页面不会销毁实例
      // Object.assign(this, this.storage.get());
      // reaction(
      //   () => ({
      //     isOpen: this.isOpen,
      //     selectedTabId: this.selectedTabId,
      //     height: this.height,
      //     tabs: this.tabs.slice(),
      //   }),
      //   data => {
      //     this.storage.set(data);
      //   }
      // );

      // adjust terminal height if window size changes
      this.checkMaxHeight();
      window.addEventListener('resize', throttle(this.checkMaxHeight, 250));
    }
  }

  protected checkMaxHeight() {
    if (!this.height) {
      this.setHeight(this.defaultHeight || this.minHeight);
    }
    if (this.height > this.maxHeight) {
      this.setHeight(this.maxHeight);
    }
  }

  onResize(callback: () => void, options?: IReactionOptions) {
    return reaction(() => [this.height, this.fullSize], callback, options);
  }

  onTabChange(callback: (tabId: TabId) => void, options?: IReactionOptions) {
    return reaction(() => this.selectedTabId, callback, options);
  }

  hasTabs() {
    return this.tabs.length > 0;
  }

  @action
  open(fullSize?: boolean) {
    this.isOpen = true;
    if (typeof fullSize === 'boolean') {
      this.fullSize = fullSize;
    }
  }

  @action
  close() {
    this.isOpen = false;
  }

  @action
  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  @action
  toggleFillSize() {
    if (!this.isOpen) this.open();
    this.fullSize = !this.fullSize;
    if (this.fullSize) {
      this.height = this.maxHeight;
    }
    if (!this.fullSize) {
      this.height = this.defaultHeight;
    }
    this.resetSizeTip();
  }

  @action
  toggleMinSize() {
    if (!this.isOpen) this.open();
    this.miniSize = !this.miniSize;
    if (this.miniSize) {
      this.height = this.minHeight;
    }
    if (!this.miniSize) {
      this.height = this.defaultHeight;
    }
    this.resetSizeTip();
  }

  @action
  resetSizeTip() {
    if (!this.isOpen) this.open();
    if (this.height > this.minHeight) {
      this.miniSize = false;
    }
    if (this.height < this.maxHeight) {
      this.fullSize = false;
    }
    if (this.height <= this.minHeight) {
      this.miniSize = true;
    }
    if (this.height >= this.maxHeight) {
      this.fullSize = true;
    }
  }

  getTabById(tabId: TabId) {
    return this.tabs.find(tab => tab.id === tabId);
  }

  protected getNewTabNumber(kind: TabKind) {
    const tabNumbers = this.tabs
      .filter(tab => tab.kind === kind)
      .map(tab => {
        const tabNumber = +tab.title.match(/\d+/);
        return tabNumber === 0 ? 1 : tabNumber; // tab without a number is first
      });
    for (let i = 1; ; i++) {
      if (!tabNumbers.includes(i)) return i;
    }
  }

  @action
  createTab(anonTab: IDockTab, addNumber = true): IDockTab {
    const tabId = MD5(Math.random().toString() + Date.now()).toString();
    const tab: IDockTab = {id: tabId, ...anonTab};
    if (addNumber) {
      // const tabNumber = this.getNewTabNumber(tab.kind);
      // if (tabNumber > 1) tab.title += ` (${tabNumber})`
      tab.title += 'Pod: ' + tab.pod + `(${tab.container})`;
    }
    this.tabs.push(tab);
    this.selectTab(tab.id);
    this.open();
    return tab;
  }

  @action
  async closeTab(tabId: TabId) {
    const tab = this.getTabById(tabId);
    if (!tab || tab.pinned) {
      return;
    }
    this.tabs.remove(tab);
    if (this.selectedTabId === tab.id) {
      if (this.tabs.length) {
        const newTab = this.tabs.slice(-1)[0]; // last
        if (newTab.kind === TabKind.TERMINAL) {
          // close the dock when selected sibling inactive terminal tab
          const {terminalStore} = await import('./terminal/terminal.store');
          if (!terminalStore.isConnected(newTab.id)) this.close();
        }
        this.selectTab(newTab.id);
      } else {
        this.selectedTabId = null;
        this.close();
      }
    }
  }

  @action
  selectTab(tabId: TabId) {
    const tab = this.getTabById(tabId);
    this.selectedTabId = tab ? tab.id : null;
  }

  @action
  setHeight(height: number) {
    this.height = Math.max(0, Math.min(height, this.maxHeight));
  }

  @action
  reset() {
    this.selectedTabId = this.defaultTabId;
    this.tabs.replace(this.initialTabs);
    this.height = this.defaultHeight;
    this.close();
  }
}

export const dockStore = new DockStore();
