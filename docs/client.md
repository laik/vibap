
> [ReadME](../README.md)

## Client

兼容 `k8s` 和 `混合云` 的前端客户端

#
### 实现功能

1. 基于 `http sse` 实现 `list/watch` 机制。[`list/watch参考`](https://zhuanlan.zhihu.com/p/59660536)
2. 实现 `资源api 增删查改` 封装, 与 `资源数据store` 绑定后，前端可通过 `资源数据store`操作资源数据。
3. `apiManager` 对 `资源api`与 `资源数据store`的 `绑定注册` 和 `全局单例` 的统一管理
4. `Webshell Websocket api`

```sh
.
├── client
│   ├── api-manager.ts
│   ├── eventsource
│   │   └── eventsource.js
│   ├── index.ts
│   ├── item.store.ts
│   ├── json-api.ts
│   ├── kube
│   │   ├── kube-object.ts
│   │   └── workload-kube-object.ts
│   ├── object-api.ts
│   ├── object-json-api.ts
│   ├── object-store-wrap.ts
│   ├── object-watch-api.ts
│   ├── object.store.ts
│   ├── object.ts
│   ├── redux-store.ts
│   ├── user-config.ts
│   ├── utils
│   │   ├── autobind.ts
│   │   ├── base64.ts
│   │   ├── cancelableFetch.ts
│   │   ├── convertMemory.ts
│   │   ├── createStorage.ts
│   │   ├── debouncePromise.ts
│   │   ├── eventEmitter.ts
│   │   ├── formatDuration.ts
│   │   ├── index.ts
│   │   ├── interval.ts
│   │   ├── op.ts
│   │   ├── toobject.ts
│   │   └── tree.ts
│   └── websocket-api.ts
```

#

[Kubernetes API 概念](https://kubernetes.io/zh/docs/reference/using-api/api-concepts/)


resource-group.api.ts
```ts
import {JsonApi} from '../../client';

export const resourceGroupApi = new JsonApi({
  debug: true,
  apiPrefix: '/resourceGroup',
});

```

resource-type.store.ts
```ts
import {CloudObject, ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {ObjectStore} from '../../../client/object.store';
import {resourceGroupApi} from '../resource-group.api';

// 1. 定义资源类型模型，相当于 `MVC` 模型中的 `Model`
export class ResourceType extends CloudObject {
  static kind = 'resourceType';

  spec: {
    // 定义与后端资源相同的结构
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

// 2. 绑定`资源类型模型`和`api`
export const resourceTypeApi = new ObjectApi({
  kind: ResourceType.kind,
  isNamespaced: true,
  apiBase: '/apis/resourceGroup.laik.fm/v1/resourceType',
  objectConstructor: ResourceType,
  request: resourceGroupApi,
});


// 3. 数据存储层，前端页面通过store操作资源数据
export class ResourceTypeStore extends ObjectStore<ResourceType> {
  api = resourceTypeApi;
}
export const resourceTypestore = new ResourceTypeStore();

// 4. 在 `apiManager`中注册资源store,提供全局调用store
apiManager.registerStore(resourceTypeApi, resourceTypestore);
```