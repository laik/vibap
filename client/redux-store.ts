import {merge} from 'lodash';
import store from 'store';
import {UserConfig} from './user-config';

const persistKey = 'persist:nextjs';

export function redux_userconfig() {
  // https://github.com/marcuswestin/store.js/
  // 通过 store.js 获取 redux localstorage 持久化的数据
  return new UserConfig(JSON.parse(store.get(persistKey, {}).user || '{}'));
}

export function redux_update_userconfig(userconfig: UserConfig) {
  let config = store.get(persistKey, {});
  merge(config, {
    user: JSON.stringify(userconfig),
  });
  store.set(persistKey, config);
}
