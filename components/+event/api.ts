import { JsonApi } from '../../client';

export const eventApi = new JsonApi({
  debug: true,
  apiPrefix: '/event',
});
