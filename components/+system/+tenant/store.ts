import { CloudObject, ObjectApi, ObjectStore } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { systemApi } from '../system.api';

export const tenantThridTools = {
  feishu: '飞书',
  weixin: '微信',
  dingding: '钉钉',
};
export class Tenant extends CloudObject {
  static kind = 'Tenant';

  spec: {
    permission: {
      [product: string]: {
        [action: string]: string[] | {[action2: string]: string[]};
      };
    }; // 已授权的资源;
    allowed: {[provider: string]: {[region: string]: string[]}};
    owner: string;
    type: string;
    key: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  isPlainObject(input): boolean {
    return input && !Array.isArray(input) && typeof input === 'object';
  }

  getPermissedToTree(): string[] {
    let res = [];
    const permission =
      this.spec?.permission && Object.entries(this.spec.permission);
    for (let [product, action] of permission) {
      const actionItems = action && Object.entries(action);
      for (let [second, third] of actionItems) {
        if (this.isPlainObject(third)) {
          const action2 = third && Object.entries(third);
          for (let [thirdValue, fourth] of action2) {
            for (let op of fourth) {
              res.push([product, second, thirdValue, op].join('.'));
            }
          }
        } else {
          const ops = third && Object.entries(third);
          for (let [_, thireValue] of ops) {
            res.push([product, second, thireValue].join('.'));
          }
        }
      }
    }
    return res;
  }

  getAllowedTreeKeys(): string[] {
    if (!this.spec?.allowed) return [];
    let items: string[] = [];
    Object.entries(this.spec.allowed).forEach(([provider, regions]) => {
      // items.push(provider);
      regions &&
        Object.entries(regions).forEach(([region, azs]) => {
          // items.push([provider, region].join('.'));
          azs &&
            azs.forEach(az => {
              items.push([provider, region, az].join('.'));
            });
        });
    });
    return items;
  }
}

export const tenantApi = new ObjectApi({
  kind: Tenant.kind,
  isNamespaced: false,
  apiBase: '/apis/system.ddx2x.nip/v1/tenant',
  objectConstructor: Tenant,
  request: systemApi,
});

export class TenantStore extends ObjectStore<Tenant> {
  api = tenantApi;
}

export const tenantStore = new TenantStore();

apiManager.registerStore(tenantApi, tenantStore);
