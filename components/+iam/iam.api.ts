import {JsonApi} from '../../client';

export const iamApi = new JsonApi({
  debug: true,
  apiPrefix: '/iam',
});
