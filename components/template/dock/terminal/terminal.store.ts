import {autorun, observable} from 'mobx';
import {WebSocketApiState} from '../../../../client';
import {classbind} from '../../../../client/utils';
import {dockStore, IDockTab, TabKind} from '../dock.store';
import Terminal, {isTerminalTab} from './terminal';
import TerminalApi from './terminal-api';

export interface ITerminalTab extends IDockTab {
  namepsace?: string;
  node?: string; // activate node shell mode
  pod?: string;
  shellType?: string;
  container?: string;
  cluster?: string;
}

export function createTerminalTab(tabParams: Partial<ITerminalTab> = {}) {
  return dockStore.createTab({
    kind: TabKind.TERMINAL,
    title: ``,
    ...tabParams,
  });
}

@classbind()
export class TerminalStore {
  protected namespace: string;
  protected pod: string;
  protected container: string;
  protected shellType: string;
  protected cluster: string;
  protected terminals = new Map<string, Terminal>();
  protected connections = observable.map<string, TerminalApi>();

  constructor() {
    // connect active tab
    autorun(() => {
      const {selectedTab, isOpen} = dockStore;
      if (!isTerminalTab(selectedTab)) return;
      if (isOpen) {
        this.connect(selectedTab.id);
      }
    });
    // disconnect closed tabs
    autorun(() => {
      const currentTabs = dockStore.tabs.map(tab => tab.id);
      for (const [tabId] of this.connections) {
        if (!currentTabs.includes(tabId)) this.disconnect(tabId);
      }
    });
  }

  async connect(tabId: string) {
    if (this.namespace && this.container) {
      if (this.isConnected(tabId)) {
        return;
      }
      const tab: ITerminalTab = dockStore.getTabById(tabId);
      const api = new TerminalApi({
        namespace: this.namespace,
        pod: this.pod,
        container: this.container,
        shellType: this.shellType,
        cluster: this.cluster,
        id: tabId,
        node: tab.node,
        colorTheme: 'light',
      });
      const terminal = new Terminal(tabId, api);
      this.connections.set(tabId, api);
      this.terminals.set(tabId, terminal);
    } else {
      dockStore.closeTab(tabId);
    }
  }

  disconnect(tabId: string) {
    if (!this.isConnected(tabId)) {
      return;
    }
    const terminal = this.terminals.get(tabId);
    const terminalApi = this.connections.get(tabId);
    terminal.destroy();
    terminalApi.destroy();
    this.connections.delete(tabId);
    this.terminals.delete(tabId);
  }

  reconnect(tabId: string) {
    const terminalApi = this.connections.get(tabId);
    if (terminalApi) terminalApi.connect();
  }

  isConnected(tabId: string) {
    return !!this.connections.get(tabId);
  }

  isDisconnected(tabId: string) {
    const terminalApi = this.connections.get(tabId);
    if (terminalApi) {
      return terminalApi.readyState === WebSocketApiState.CLOSED;
    }
  }

  sendCommand(
    command: string,
    options: {enter?: boolean; newTab?: boolean; tabId?: string} = {}
  ) {
    const {enter, newTab, tabId} = options;
    const {selectTab, getTabById} = dockStore;

    const tab = tabId && getTabById(tabId);
    if (tab) selectTab(tabId);
    if (newTab) createTerminalTab();

    const terminalApi = this.connections.get(tabId);
    if (terminalApi) {
      terminalApi.emitStatus(command);
      if (enter) {
        const dataObj = {Data: command + (enter ? '\r' : '')};
        terminalApi.sendCommand(dataObj);
      }
    }
  }

  async startTerminal(
    namespace: string,
    pod: string,
    container: string,
    shellType?: string,
    cluster?: string,
    options: {newTab?: boolean; tabId?: string} = {}
  ) {
    this.namespace = namespace;
    this.pod = pod;
    this.container = container;
    this.shellType = shellType;
    this.cluster = cluster;

    const {newTab, tabId} = options;
    const {selectTab, getTabById} = dockStore;
    const tab = tabId && getTabById(tabId);
    if (tab) selectTab(tabId);
    if (newTab)
      createTerminalTab({
        namepsace: this.namespace,
        pod: this.pod,
        container: this.container,
        shellType: this.shellType,
        cluster: this.cluster,
      });
  }

  getTerminal(tabId: string) {
    return this.terminals.get(tabId);
  }

  reset() {
    [...this.connections].forEach(([tabId]) => {
      this.disconnect(tabId);
    });
  }
}

export const terminalStore = new TerminalStore();
