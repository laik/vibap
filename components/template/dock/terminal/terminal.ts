import debounce from 'lodash/debounce';
import { autorun } from 'mobx';
import { Terminal as XTerm } from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {SerializeAddon} from 'xterm-addon-serialize';
import {WebLinksAddon} from 'xterm-addon-web-links';
import {dockStore, IDockTab, TabKind} from '../dock.store';
import TerminalApi from './terminal-api';
import { colors } from './terminal-theme';
import 'xterm/css/xterm.css';

export function isTerminalTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.TERMINAL;
}

export default class Terminal {
  static spawningPool: HTMLElement;

  static init() {
    const pool = document.createElement('div');
    pool.className = 'terminal-init';
    pool.style.cssText =
      'position: absolute; top: 0; left: 0; height: 0; visibility: hidden; overflow: hidden';
    document.body.appendChild(pool);
    Terminal.spawningPool = pool;
  }

  public xterm: XTerm;
  public fitAddon: FitAddon;
  public serializeAddon: SerializeAddon;
  public webLinksAddon: WebLinksAddon;
  public scrollPos = 0;
  public disposers: Function[] = [];

  protected setTheme = color => {
    const terminalColors = Object.entries(colors[color]).reduce<any>(
      (colors, [name, color]) => {
        name = name.toLowerCase();
        colors[name] = color;
        return colors;
      },
      {}
    );
    this.xterm.setOption('theme', terminalColors);
  };

  get elem() {
    return this.xterm.element;
  }

  get viewport() {
    return this.xterm.element.querySelector('.xterm-viewport');
  }

  constructor(public tabId: string, protected api: TerminalApi) {
    this.init();
  }

  get isActive() {
    const {isOpen, selectedTabId} = dockStore;
    return isOpen && selectedTabId === this.tabId;
  }

  attachTo(parentElem: HTMLElement) {
    parentElem.appendChild(this.elem);
    this.onActivate();
  }

  detach() {
    Terminal.spawningPool.appendChild(this.elem);
  }

  init() {
    if (this.xterm) {
      return;
    }
    this.xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 14.5,
      fontFamily: 'Monospace',
    });

    // enable terminal addons
    this.fitAddon = new FitAddon();
    this.serializeAddon = new SerializeAddon();
    this.webLinksAddon = new WebLinksAddon();

    this.xterm.loadAddon(this.fitAddon);
    this.xterm.loadAddon(this.serializeAddon);
    this.xterm.loadAddon(this.webLinksAddon);
    this.xterm.attachCustomKeyEventHandler(this.keyHandler);

    this.xterm.open(Terminal.spawningPool);
    // bind events
    const onResizeDisposer = dockStore.onResize(this.onResize);
    const onData = this.xterm.onData(this.onData);
    const onThemeChangeDisposer = autorun(() => this.setTheme('light'));
    this.viewport.addEventListener('scroll', this.onScroll);
    this.api.onReady.addListener(this.onClear, {once: false}); // clear status logs (connecting..)
    this.api.onData.addListener(this.onApiData); // api listener
    window.addEventListener('resize', this.onResize);

    // add clean-up handlers to be called on destroy
    this.disposers.push(
      onResizeDisposer,
      onThemeChangeDisposer,
      () => onData.dispose(),
      () => this.fitAddon.dispose(),
      () => this.api.removeAllListeners(),
      () => window.removeEventListener('resize', this.onResize)
    );
  }

  destroy() {
    if (!this.xterm) return;
    this.disposers.forEach(dispose => dispose());
    this.disposers = [];
    this.xterm.dispose();
    this.xterm = null;
  }

  fit = () => {
    if (!this.xterm) return;
    if (!this.fitAddon) this.fitAddon = new FitAddon();
    this.fitAddon.fit(); //TODO: ?????????fitAddon?????????
    const {cols, rows} = this.xterm;
    this.api.sendTerminalSize(cols, rows);
  };

  fitLazy = debounce(this.fit, 250);

  focus = () => {
    this.xterm.focus();
  };

  onApiData = (data: string) => {
    this.fitLazy();
    this.xterm.write(typeof data === 'string' ? data : new Uint8Array(data));
  };

  onData = (data: string) => {
    this.api.sendCommand({Data: data});
  };

  onScroll = () => {
    this.scrollPos = this.viewport.scrollTop;
  };

  onClear = () => {
    this.xterm.clear();
  };

  onResize = () => {
    if (!this.isActive) return;
    this.fitLazy();
  };

  onActivate = () => {
    this.fit();
    setTimeout(() => this.focus(), 250); // delay used to prevent focus on active tab
    this.viewport.scrollTop = this.scrollPos; // restore last scroll position
  };

  onClickLink = (evt: MouseEvent, link: string) => {
    window.open(link, '_blank');
  };

  keyHandler = (evt: KeyboardEvent): boolean => {
    const {code, ctrlKey, type} = evt;

    // Handle custom hotkey bindings
    if (ctrlKey) {
      switch (code) {
        // Ctrl+C: prevent terminal exit on windows / linux (?)
        case 'KeyC':
          if (this.xterm.hasSelection()) return false;
          break;
        // Ctrl+W: prevent unexpected terminal tab closing, e.g. editing file in vim
        // https://github.com/kontena/lens-app/issues/156#issuecomment-534906480
        case 'KeyW':
          evt.preventDefault();
          break;
      }
    }
    // Pass the event above in DOM for <Dock/> to handle common actions
    if (!evt.defaultPrevented) {
      this.elem.dispatchEvent(new KeyboardEvent(type, evt));
    }
    return true;
  };
}

Terminal.init();
