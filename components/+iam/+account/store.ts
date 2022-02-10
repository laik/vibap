import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { iamApi } from '../iam.api';

export const accountTypeMap = {
  3: '管理员',
  4: '租户',
};

export const getAccountType = (type: number): string => {
  return accountTypeMap[type];
};

export class Account extends CloudObject {
  static kind = 'Account';

  spec: {
    account_type: number;
    business_group_role: {[businessGroupId: string]: string[]};
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  getAccountType() {
    return this.spec?.account_type || 0;
  }

  getBizTree(): string[] {
    // biz->role
    return (
      (this.spec.business_group_role &&
        Object.entries(this.spec.business_group_role)
          .map(([bizId, roles]) => {
            var roleList: string[] = [];
            if (roles.length == 0) {
              roleList = [bizId];
            } else {
              roleList = roles.map(roleId => [bizId, roleId].join('.'));
            }

            return roleList;
          })
          .reduce((acc, cur) => acc.concat(cur), [])) ||
      []
    );
  }
}

export const accountApi = new ObjectApi({
  kind: Account.kind,
  isNamespaced: false,
  apiBase: '/apis/iam.ddx2x.nip/v1/account',
  objectConstructor: Account,
  request: iamApi,
});

export class AccountStore extends ObjectStore<Account> {
  api = accountApi;
}

export const accountStore = new AccountStore();

apiManager.registerStore(accountApi, accountStore);
