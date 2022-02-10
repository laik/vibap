import { CloudObject, ObjectApi, ObjectStore } from '../../../client';
import { apiManager } from '../../../client/api-manager';
import { systemApi } from '../system.api';

export class Theme extends CloudObject {
  static kind = 'Theme';

  spec: {
    mui?: string;
    data_grid?: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  getMui = () => {
    const mui = JSON.parse(this.spec.mui) || {};
    return mui;
  };
}

export const themeApi = new ObjectApi({
  kind: Theme.kind,
  isNamespaced: false,
  apiBase: '/apis/system.ddx2x.nip/v1/theme',
  objectConstructor: Theme,
  request: systemApi,
});

export class ThemeStore extends ObjectStore<Theme> {
  api = themeApi;
}

export const themeStore = new ThemeStore();

apiManager.registerStore(themeApi, themeStore);
