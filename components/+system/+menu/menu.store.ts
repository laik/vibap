import {CloudObject, ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {ObjectStore} from '../../../client/object.store';
import {systemApi} from '../system.api';

export const menuTypeCode = ['product', 'action'];
export const menuTypeName = ['产品', '业务'];

export class Menu extends CloudObject {
  static kind = 'Menu';

  spec: {
    link: string;
    title: string;
    icon: string;
    type: string;
    level: number;
    is_sub_menu: boolean;
    parent: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }

  parentMenu(): string {
    return this.spec?.parent || '';
  }
}

export const menuApi = new ObjectApi({
  kind: Menu.kind,
  isNamespaced: false,
  apiBase: '/apis/system.laik.fm/v1/menu',
  objectConstructor: Menu,
  request: systemApi,
});

export class MenuStore extends ObjectStore<Menu> {
  api = menuApi;
}

export const menuStore = new MenuStore();

apiManager.registerStore(menuApi, menuStore);
