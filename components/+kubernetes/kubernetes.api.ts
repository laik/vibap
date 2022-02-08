import {JsonApi} from '../../client';

export const DefaultNamespace: string = 'dxp';

export const kubernetesApi = new JsonApi({
  debug: true,
  apiPrefix: '/kes',
});
