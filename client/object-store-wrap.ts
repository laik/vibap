import { ObjectStore } from './object.store';

export function storeables<S extends ObjectStore>(
  s: S[],
  isCloudPlatform: boolean = true // 云平台资源
) {
  return function classes<T extends { new(...args: any[]): {} }>(
    constructor: T
  ) {
    return class extends constructor {
      defaultSortInfo = {name: 'updatetime', dir: -1};
      componentDidMount() {
        // 页面生命周期挂载完成后，批量加载资源，创建 watch 接口
        s.map(item => {
          item
            .loadAll(isCloudPlatform)
            .then(() => {
              if (item.isLoaded) {
                item.watch(isCloudPlatform);
              }
            })
            .catch(err => {
              console.error(err);
            });
        });
      }
      componentWillUnmount() {
        // 页面生命周期即将销毁时，批量注销资源
        s.map(item => item.stop());
      }
    };
  };
}
