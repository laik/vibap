import { CloudObject, ObjectApi, ObjectStore } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { iamApi } from '../iam.api';

export class User extends CloudObject {
  static kind = 'User';

  spec: {
    cn_name: string;
    owner: string;
    workspaces: string[];
    roles: string[];
    department_id: string;
    account?: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const userApi = new ObjectApi({
  kind: User.kind,
  isNamespaced: false,
  apiBase: '/apis/iam.ddx2x.nip/v1/user',
  objectConstructor: User,
  request: iamApi,
});

export class UserStore extends ObjectStore<User> {
  api = userApi;
}

export const userStore = new UserStore();

apiManager.registerStore(userApi, userStore);
