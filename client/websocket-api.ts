import { observable } from 'mobx';
import SockJS from 'sockjs-client';
// import Stomp from 'stompjs';
import { podApi } from '../components/+kubernetes/+pods/pods.store';
import { EventEmitter } from './utils/eventEmitter';

const WebSocket = require('websocket').w3cwebsocket;

const welcome = `
Cloud Platform === \r\n
             === == ==\r\n
 /"""""""""""""" //\\___/ === == == \r\n
{                       /  == = \r\n
 \\______ O           _ _/  == === == \r\n
   \\    \\         _ _/ == === ===\r\n
    \\____\\_______/__/__/ == == == \r\n
`;

interface IParams {
  url?: string; // connection url, starts with ws:// or wss://
  autoConnect?: boolean; // auto-connect in constructor
  flushOnOpen?: boolean; // flush pending commands on open socket
  reconnectDelaySeconds?: number; // reconnect timeout in case of error (0 - don't reconnect)
  pingIntervalSeconds?: number; // send ping message for keeping connection alive in some env, e.g. AWS (0 - don't ping)
  logging?: boolean; // show logs in console
  namespace: string; // Namespace
  pod: string; // kubernetes Pod
  container: string; // kubernetes Container
  shellType: string; //shell type include:commom,debug shell.two kind shell
  cluster: string; // kubernetes Cluster
}

interface IMessage {
  id: string;
  data: string;
}

export enum WebSocketApiState {
  PENDING = -1,
  OPEN,
  CONNECTING,
  RECONNECTING,
  CLOSED,
}

export class WebSocketApi {
  protected socket?: WebSocket;
  protected pendingCommands: IMessage[] = [];
  protected reconnectTimer: any;
  protected pingTimer: any;
  protected pingMessage = 'PING';
  protected namespace: string;
  protected pod: string;
  protected container: string;
  protected shellType: string;
  protected cluster: string;
  protected op: number;
  protected sessionId: string;

  @observable readyState = WebSocketApiState.PENDING;

  public onOpen = new EventEmitter<[]>();
  public onData = new EventEmitter<[string]>();
  public onClose = new EventEmitter<[]>();

  static defaultParams: Partial<IParams> = {
    namespace: '',
    pod: '',
    container: '',
    shellType: '',
    cluster: '',
    autoConnect: true,
    logging: true,
    reconnectDelaySeconds: 10,
    pingIntervalSeconds: 0,
    flushOnOpen: true,
  };

  constructor(protected params: IParams) {
    this.params = Object.assign({}, WebSocketApi.defaultParams, params);
    const {
      namespace,
      pod,
      container,
      shellType,
      cluster,
      autoConnect,
      pingIntervalSeconds,
    } = this.params;
    this.namespace = namespace;
    this.pod = pod;
    this.container = container;
    this.shellType = shellType;
    this.cluster = cluster;
    if (autoConnect) {
      setTimeout(() => this.connect(), 3000);
    }
    if (pingIntervalSeconds) {
      this.pingTimer = setInterval(
        () => this.ping(),
        pingIntervalSeconds * 1000
      );
    }
  }

  get isConnected() {
    const state = this.socket ? this.socket.readyState : -1;
    return state === WebSocket.OPEN;
  }

  get isOnline() {
    return navigator.onLine;
  }

  setParams(params: Partial<IParams>) {
    Object.assign(this.params, params);
  }

  connect(url = this.params.url) {
    if (this.socket) {
      this.socket.close(); // close previous connection first
    }
    this.refreshSession();
    this.socket = new SockJS(url);
    // this.socket = Stomp.over(new SockJS(url));
    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onmessage = this._onMessage.bind(this);
    this.socket.onerror = this._onError.bind(this);
    this.socket.onclose = this._onClose.bind(this);
    this.readyState = WebSocketApiState.CONNECTING;
  }

  ping() {
    if (!this.isConnected) return;
    this.send(this.pingMessage);
  }

  reconnect() {
    const { reconnectDelaySeconds } = this.params;
    if (!reconnectDelaySeconds) return;
    this.writeLog('reconnect after', reconnectDelaySeconds + 'ms');
    this.reconnectTimer = setTimeout(
      () => this.connect(),
      reconnectDelaySeconds * 1000
    );
    this.readyState = WebSocketApiState.RECONNECTING;
  }

  destroy() {
    if (!this.socket) return;
    if (typeof this.socket.close === 'function') this.socket.close();
    this.socket = null;
    // this.pendingCommands = [];
    this.removeAllListeners();
    clearTimeout(this.reconnectTimer);
    clearInterval(this.pingTimer);
    this.readyState = WebSocketApiState.PENDING;
  }

  async refreshSession() {
    const apiSession = await podApi.getTerminalSession({
      namespace: this.namespace,
      pod: this.pod,
      container: this.container || this.pod,
      shellType: this.shellType,
      cluster: this.cluster,
    });
    this.op = apiSession.op;
    this.sessionId = apiSession.sessionId;
  }

  removeAllListeners() {
    this.onOpen.removeAllListeners();
    this.onData.removeAllListeners();
    this.onClose.removeAllListeners();
  }

  send(msg: string) {
    if (this.isConnected) {
      this.socket.send(msg);
    }
  }

  protected flush() {
    this.pendingCommands.forEach(msg => this.send(msg.data));
    this.pendingCommands.length = 0;
  }

  protected parseMessage(data: string) {
    return data;
  }

  protected _onOpen(evt: Event) {
    const data = { Op: this.op, sessionID: this.sessionId };
    this.onData.emit(welcome);
    if (this.params.flushOnOpen) this.flush();
    this.readyState = WebSocketApiState.OPEN;
    this.writeLog('%cOPEN', 'color:green;font-weight:bold;', evt);
    this.send(JSON.stringify(data));
  }

  protected _onMessage(evt: MessageEvent) {
    const data = JSON.parse(evt.data);
    this.onData.emit(data.Data);
    this.readyState = WebSocketApiState.CONNECTING;
  }

  protected _onError(evt: Event) {
    this.writeLog('%cERROR', 'color:red;font-weight:bold;', evt);
  }

  protected _onClose(evt: CloseEvent) {
    const error = evt.type == 'close' || !evt.wasClean;
    this.onClose.emit();
    this.onData.emit(evt.reason || 'unknown backend server error');
    this.readyState = WebSocketApiState.CLOSED;
    this.writeLog(
      '%cCLOSE',
      `color:${error ? 'red' : 'black'};font-weight:bold;`,
      evt
    );
  }

  protected writeLog(...data: any[]) {
    if (this.params.logging) {
      console.log(...data);
    }
  }
}
