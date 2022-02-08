import {JsonApi} from '../../client';

export const networkingApi = new JsonApi({
  debug: true,
  apiPrefix: '/networking',
});
