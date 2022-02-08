import { IObjectApiQueryParams, ObjectJsonApiData, ObjectJsonApiDataList, ObjectStore } from '.';
import { ItemObject } from './item.store';

export type ICloudObjectConstructor<T extends CloudObject = any> = new (
  data: ObjectJsonApiData | any
) => T & { kind?: string };

export interface CloudObjectMetadata {
  name: string;
  kind?: string;
  version?: string;
  uuid?: string;
  uid?: string;
  workspace?: string;
  namespace?: string;
  tenant?: string;
  labels?: {
    [label: string]: string;
  };
  area?: number;
}

export type ICloudObjectMetaField = keyof CloudObject['metadata'];

export class CloudObject implements ItemObject {
  static readonly kind: string;
  metadata: CloudObjectMetadata;

  constructor(data: ObjectJsonApiData) {
    Object.assign(this, data);
  }
  getSelfLink(): string {
    return '';
  }

  getResource(): string {
    return this.metadata.kind; // 资源类型
  }

  getResourceVersion(): string {
    return this.getVersion();  // 资源版本
  }

  getNs(): string {
    return this.metadata.workspace; // 工作空间
  }

  getWorkspace(): string {
    return this.metadata.workspace; // 工作空间
  }

  getNamespace(): string {
    return this.metadata.namespace; // 命名空间
  }

  getTenant(): string {
    return this.metadata.tenant; // 租户
  }

  getId(): string {
    return this.metadata.uuid;  // id
  }

  static isJsonApiData(object: any): object is ObjectJsonApiData {
    return !object.items && object.metadata;
  }

  static isJsonApiDataList(object: any): object is ObjectJsonApiDataList {
    return object.items && object.metadata;
  }

  static stringifyData(data: { [label: string]: string }): string[] {
    if (!data) return [];
    return Object.entries(data).map(([label, value]) => `${label}=${value}`);
  }

  static stringifyLabels(labels: { [label: string]: string }): string[] {
    return CloudObject.stringifyData(labels)
  }

  static unstringifyLables(labels: string[]): { [label: string]: string } {
    if (labels.length == 0) return {};
    return labels
      .map(item => item.split('='))
      .reduce((o, [k, v]) => {
        o[k] = v;
        return o;
      }, {});
  }

  getName() {
    return this.metadata.name;
  }

  getKind() {
    return this.metadata.kind;
  }

  getVersion() {
    return String(this.metadata.version); 
  }

  getUUID() {
    return this.metadata.uuid; // uuid
  }

  getLabel(key: string) {
    return CloudObject.unstringifyLables(this.getLabels())[key] || '';
  }

  getLabels(): string[] {
    return CloudObject.stringifyLabels(this.metadata.labels);
  }

  cloneLables(): { [key: string]: string } {
    return CloudObject.unstringifyLables(this.getLabels());
  }

  removeLable(key: string) {
    this.metadata.labels = Object.fromEntries(
      Object.entries(CloudObject.unstringifyLables(this.getLabels())).filter(
        ([k]) => key !== k
      )
    );
  }

  getUpdateTime() {
    const now = new Date(Number(this.metadata.version) * 1000);
    return now.getFullYear()
      + '-' + String(now.getMonth() + 1)
      + '-' + now.getDate()
      + ' ' + now.getHours()
      + ':' + String(now.getMinutes()).padStart(2, '0')
      + ':' + String(now.getSeconds()).padStart(2, '0');
  }

  toPlainObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  async update<S extends ObjectStore, T extends CloudObject>(store: S, data: Partial<T>, query?: IObjectApiQueryParams) {
    return store.api.update(
      { name: this.getName(), namespace: this.getNs() },
      data,
      query,
    );
  }
}
