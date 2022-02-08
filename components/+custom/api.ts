import { JsonApi } from '../../client';

export const customApi = new JsonApi({
  debug: true,
  apiPrefix: '/cr',
});
