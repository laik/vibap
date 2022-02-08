import {CloudObject, ObjectApi} from '../../../client';
import {apiManager} from '../../../client/api-manager';
import {ObjectStore} from '../../../client/object.store';
import {eventApi} from '../api';

export class CloudEvent extends CloudObject {
  static kind = 'cloudevent';

  spec: {
    source?: string;
    name?: string;
    action?: string;
    operator?: string;
    source_workspace?: string;
    operator_status?: string;
  };

  constructor(data: any) {
    super(data);
    Object.assign(this, data);
  }
}

export const cloudEventApi = new ObjectApi({
  kind: CloudEvent.kind,
  isNamespaced: true,
  apiBase: '/apis/event.laik.fm/v1/cloudevent',
  objectConstructor: CloudEvent,
  request: eventApi,
});

export class CloudEventStore extends ObjectStore<CloudEvent> {
  api = cloudEventApi;
}

export const cloudEventStore = new CloudEventStore();

apiManager.registerStore(cloudEventApi, cloudEventStore);
