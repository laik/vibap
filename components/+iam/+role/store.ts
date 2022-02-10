import { CloudObject, ObjectApi, ObjectStore } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { iamApi } from '../iam.api';

export interface IrolePermission {
  product?: string;
  ops?: string[];
}

export class Role extends CloudObject {
  static kind = 'Role';

  spec: {
    business: string;
    remark: string;
    permission: {
      [product: string]: {
        [action: string]: string[] | {[action2: string]: string[]};
      };
    }; // 已授权的资源;
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
    if (!permission) {
      return res;
    }
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
}

export const roleApi = new ObjectApi({
  kind: Role.kind,
  isNamespaced: false,
  apiBase: '/apis/iam.ddx2x.nip/v1/role',
  objectConstructor: Role,
  request: iamApi,
});

export class RoleStore extends ObjectStore<Role> {
  api = roleApi;
}

export const roleStore = new RoleStore();

apiManager.registerStore(roleApi, roleStore);
