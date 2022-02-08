import {customApi} from '../../+custom/api';
import {apiManager, CloudObject, ObjectApi, ObjectStore} from '../../../client';

export class CustomResource extends CloudObject {
  static kind = 'CustomResource';
  spec: {
    custom_resource: {
      [key: string]: string;
    };
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const customResourceApi = new ObjectApi({
  kind: CustomResource.kind,
  isNamespaced: false,
  apiBase: '/apis/cr.laik.fm/v1/customresource',
  objectConstructor: CustomResource,
  request: customApi,
});

export class CustomResourceStore extends ObjectStore<CustomResource> {
  api = customResourceApi;
}

export const customResourceStore = new CustomResourceStore();

apiManager.registerStore(customResourceApi, customResourceStore);
