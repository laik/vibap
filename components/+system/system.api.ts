import { JsonApi } from '../../client';

export const systemApi = new JsonApi({
  debug: true,
  apiPrefix: '/system',
});
