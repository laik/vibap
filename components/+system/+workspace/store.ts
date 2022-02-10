import { CloudObject, ObjectApi } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { ObjectStore } from '../../../client/object.store';
import { systemApi } from '../system.api';

export class Workspace extends CloudObject {
  static kind = 'Workspace';

  spec: {
    tenant: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

// workspace resource metadata.workspace is tenant
export const workspaceApi = new ObjectApi({
  kind: Workspace.kind,
  isNamespaced: false,
  apiBase: '/apis/system.ddx2x.nip/v1/workspace',
  objectConstructor: Workspace,
  request: systemApi,
});

export class WorkspaceStore extends ObjectStore<Workspace> {
  api = workspaceApi;

  constructor() {
    super();
  }
}

export const workspaceStore = new WorkspaceStore();

apiManager.registerStore(workspaceApi, workspaceStore);
