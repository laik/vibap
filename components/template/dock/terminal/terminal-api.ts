import isEqual from 'lodash/isEqual';
import {
  base64,
  classbind,
  EventEmitter,
  methodbind,
} from '../../../../client/utils';
import {WebSocketApi} from '../../../../client/websocket-api';

export enum TerminalChannels {
  STDIN = 1,
  STDOUT = 2,
  TERMINAL_SIZE = 3,
  TOAST = 4,
  INEXIT = 5,
  OUTEXIT = 6,
}

enum TerminalColor {
  RED = '\u001b[31m',
  GREEN = '\u001b[32m',
  YELLOW = '\u001b[33m',
  BLUE = '\u001b[34m',
  MAGENTA = '\u001b[35m',
  CYAN = '\u001b[36m',
  GRAY = '\u001b[90m',
  LIGHT_GRAY = '\u001b[37m',
  NO_COLOR = '\u001b[0m',
}

export interface ITerminalApiOptions {
  namespace: string;
  pod: string;
  container: string;
  shellType: string;
  cluster: string;
  id: string;
  node?: string;
  colorTheme?: 'light' | 'dark';
}

@classbind()
export default class TerminalApi extends WebSocketApi {
  protected size: {Width: number; Height: number};
  protected currentToken: string;
  public onReady = new EventEmitter<[]>();
  public isReady = false;

  constructor(protected options: ITerminalApiOptions) {
    super({
      namespace: options.namespace,
      pod: options.pod,
      container: options.container,
      shellType: options.shellType,
      cluster: options.cluster,
      autoConnect: true,
      flushOnOpen: false,
      pingIntervalSeconds: 30,
    });
  }

  async getUrl() {
    // return `${backendServer}/kes/shell/pod`;
    return `/api/kes/shell/pod`;
  }

  async connect() {
    const apiUrl = await this.getUrl();
    this.emitStatus('\r\n Connecting terminal.....');
    this.onData.addListener(this._onReady, {prepend: true});
    return super.connect(apiUrl);
  }

  destroy() {
    if (!this.socket) return;
    const exitCode = String.fromCharCode(4); // ctrl+d
    const dataObj = {Data: exitCode};
    this.sendCommand(dataObj, TerminalChannels.INEXIT);
    setTimeout(() => super.destroy(), 2000);
  }

  removeAllListeners() {
    super.removeAllListeners();
    this.onReady.removeAllListeners();
  }

  @methodbind()
  protected _onReady(data: string) {
    if (!data) return;
    this.isReady = true;
    this.onReady.emit();
    this.onData.removeListener(this._onReady);
    // this.flush()
    this.onData.emit(data); // re-emit data
    return false; // prevent calling rest of listeners
  }

  reconnect() {
    const {reconnectDelaySeconds} = this.params;
    super.reconnect();
  }

  sendCommand(dataObj: any, channel = TerminalChannels.STDIN) {
    // this.onData.emit(dataObj)
    dataObj.Op = channel;
    const msg = JSON.stringify(dataObj);
    return this.send(msg);
  }

  sendTerminalSize(cols: number, rows: number) {
    const newSize = {Width: cols, Height: rows};
    if (!isEqual(this.size, newSize)) {
      this.sendCommand(newSize, TerminalChannels.TERMINAL_SIZE);
      this.size = newSize;
    }
  }

  protected parseMessage(data: string) {
    data = data.substr(1); // skip channel
    return base64.decode(data);
  }

  protected _onOpen(evt: Event) {
    this.sendTerminalSize(120, 80);
    super._onOpen(evt);
  }

  protected _onClose(evt: CloseEvent) {
    super._onClose(evt);
    this.isReady = false;
  }

  emitStatus(
    data: string,
    options: {color?: TerminalColor; showTime?: boolean} = {}
  ) {
    const {color, showTime} = options;
    if (color) {
      data = `${color}${data}${TerminalColor.NO_COLOR}`;
    }
    let time;
    if (showTime) {
      time = new Date().toLocaleString() + ' ';
    }
    this.onData.emit(`${showTime ? time : ''}${data}\r\n`);
  }

  protected emitError(error: string) {
    this.emitStatus(error, {
      color: TerminalColor.RED,
    });
  }
}
