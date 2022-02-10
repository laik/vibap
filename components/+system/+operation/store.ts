import { CloudObject, ObjectApi, ObjectStore } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { systemApi } from '../system.api';

export class Operation extends CloudObject {
  static kind = 'Operation';

  spec: {
    op: string;
    method: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const operationApi = new ObjectApi({
  kind: Operation.kind,
  isNamespaced: false,
  apiBase: '/apis/system.ddx2x.nip/v1/operation',
  objectConstructor: Operation,
  request: systemApi,
});

export class OperationStore extends ObjectStore<Operation> {
  api = operationApi;
}

export const operationStore = new OperationStore();

apiManager.registerStore(operationApi, operationStore);
