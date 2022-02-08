// Base class for all kubernetes objects

import moment from 'moment';
import {ItemObject} from '../item.store';
import {JsonApiData} from '../json-api';
import {CloudObject, CloudObjectMetadata} from '../object';
import {ObjectApi} from '../object-api';
import {classbind, formatDuration} from '../utils';

export interface IKubeObjectMetadata extends CloudObjectMetadata {
  uid: string;
  creationTimestamp: string;
  resourceVersion: string;
  selfLink: string;
  namespace: string;
  deletionTimestamp?: string;
  finalizers?: string[];
  continue?: string; // provided when used "?limit=" query param to fetch objects list
  annotations?: {
    [annotation: string]: string;
  };
  ownerReferences?: OwnerReferences[];
}

export interface OwnerReferences {
  apiVersion: string;
  kind: string;
  name: string;
  uid: string;
  controller: boolean;
  blockOwnerDeletion: boolean;
}

export type IKubeMetaField = keyof KubeObject['metadata'] &
  keyof KubeObject['kind'] &
  keyof KubeObject['apiVersion'];

export interface IKubeApiLinkRef {
  apiPrefix?: string;
  apiVersion: string;
  resource: string;
  name: string;
  namespace?: string;
}

export interface KubeJsonApiData extends JsonApiData {
  metadata: {
    uid: string;
    name: string;
    namespace?: string;
    creationTimestamp?: string;
    resourceVersion: string;
    continue?: string;
    finalizers?: string[];
    selfLink: string;
    labels?: {
      [label: string]: string;
    };
    annotations?: {
      [annotation: string]: string;
    };
  };
}

export function createKubeApiURL(ref: IKubeApiLinkRef): string {
  const {apiPrefix = '/apis', resource, apiVersion, name} = ref;
  let {namespace} = ref;

  if (namespace) {
    namespace = `namespaces/${namespace}`;
  }

  return [apiPrefix, apiVersion, namespace, resource, name]
    .filter(v => v)
    .join('/');
}

export function ensureObjectSelfLink(
  api: ObjectApi<KubeObject>,
  object: KubeJsonApiData
) {
  if (!object.metadata.selfLink) {
    object.metadata.selfLink = createKubeApiURL({
      apiPrefix: api.apiPrefix,
      apiVersion: api.apiVersionWithGroup,
      resource: api.apiResource,
      namespace: api.isNamespaced ? object.metadata.namespace : undefined,
      name: object.metadata.name,
    });
  }
}

export interface KubeItemObject extends ItemObject {
  getProvider(): string;
  getRegion(): string;
  getAz(): string;
  getCluster(): string;
}

@classbind()
export class KubeObject extends CloudObject implements KubeItemObject {
  apiVersion: string;
  kind: string;
  metadata: IKubeObjectMetadata;

  static readonly kind: string;

  static create(data: any) {
    return new KubeObject(data);
  }

  get selfLink() {
    return this.metadata.selfLink;
  }

  getProvider(): string {
    return this.getAnnotation('provider');
  }

  getRegion(): string {
    return this.getAnnotation('region');
  }

  getAz(): string {
    return this.getAnnotation('az');
  }

  getCluster(): string {
    return this.getAnnotation('cluster');
  }

  getNs(): string {
    return this.metadata.namespace;
  }

  getId(): string {
    return this.metadata.uid;
  }

  getResourceVersion() {
    return this.metadata.resourceVersion;
  }

  getCreationTime() {
    return this.metadata.creationTimestamp;
  }

  // todo: refactor with named arguments
  getAge(humanize = true, compact = true, fromNow = false) {
    if (fromNow) {
      return moment(this.metadata.creationTimestamp).fromNow();
    }
    const diff =
      new Date().getTime() -
      new Date(this.metadata.creationTimestamp).getTime();
    if (humanize) {
      return formatDuration(diff, compact);
    }
    return diff;
  }

  getFinalizers(): string[] {
    return this.metadata.finalizers || [];
  }

  addOwnerReferences(ownerReferences: OwnerReferences[]) {
    if (ownerReferences !== undefined) {
      Object.assign((this.metadata.ownerReferences = []), ownerReferences);
    }
  }

  getOwnerReferences() {
    return this.metadata.ownerReferences || [];
  }

  getAnnotation(key: string): string {
    const annotations = this.metadata.annotations;
    if (!annotations) {
      return '';
    }
    return annotations[key];
  }

  getAnnotations(): string[] {
    return CloudObject.stringifyData(this.metadata.annotations);
  }

  cloneAnnotations(): {[key: string]: string} {
    return this.metadata.annotations;
  }

  removeAnnotation(key: string) {
    this.metadata.annotations = Object.fromEntries(
      Object.entries(this.metadata.annotations).filter(([k]) => key !== k)
    );
  }
}
