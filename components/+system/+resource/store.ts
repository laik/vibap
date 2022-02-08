import {CloudObject, ObjectApi, ObjectStore} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {systemApi} from '../system.api';

export const ResourceTypeMap = {
  1: '私有资源',
  2: '公共资源',
};

export const ResourceTypeOfRoleMap = {
  1: '无',
  2: '租户属主',
  3: '业务组属主',
};

export class Resource extends CloudObject {
  static kind = 'Resource';

  spec: {
    resourceName: string;
    apiVersion: string;
    menu: string;
    group: string;
    kind: string;
    ops: string[];
    type: number;
    type_of_role: number;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const resourceApi = new ObjectApi({
  kind: Resource.kind,
  isNamespaced: false,
  apiBase: '/apis/system.laik.fm/v1/resource',
  objectConstructor: Resource,
  request: systemApi,
});

export class ResourceStore extends ObjectStore<Resource> {
  api = resourceApi;

  getOpsByMenu(menu: string): string[] {
    return this.items
      .filter(item => item.spec.menu === menu)
      .map(item => item.spec.ops)
      .reduce((acc, cur) => acc.concat(cur), []);
  }
}

export const resourceStore = new ResourceStore();

apiManager.registerStore(resourceApi, resourceStore);
