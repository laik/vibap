import { CloudObject, ObjectApi, ObjectStore } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { iamApi } from '../iam.api';

export class BusinessGroup extends CloudObject {
  static kind = 'BusinessGroup';

  spec: {
    owner: string;
    ownerName: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const businessGroupApi = new ObjectApi({
  kind: BusinessGroup.kind,
  isNamespaced: false,
  apiBase: '/apis/iam.ddx2x.nip/v1/businessgroup',
  objectConstructor: BusinessGroup,
  request: iamApi,
});

export class BusinessGroupStore extends ObjectStore<BusinessGroup> {
  api = businessGroupApi;
}

export const businessGroupStore = new BusinessGroupStore();

apiManager.registerStore(businessGroupApi, businessGroupStore);
