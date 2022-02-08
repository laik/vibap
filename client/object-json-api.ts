import {JsonApi, JsonApiData, JsonApiError} from './json-api';

export interface IMetadata {
  uuid?: string;
  uid?: string;
  name: string;
  kind: string;
  namespace?: string;
  workspace?: string;
  labels?: {
    [label: string]: string;
  };
  version: string;
  resourceVersion?: string;
  area: number;
}

export interface ObjectJsonApiData extends JsonApiData {
  metadata: IMetadata;
}

export interface ObjectJsonApiDataList<T = ObjectJsonApiData> {
  items: T[];
  metadata: IMetadata;
}

export interface ObjectJsonApiError extends JsonApiError {
  code: number;
  status: string;
  message?: string;
  reason: string;
  details: {
    name: string;
    kind: string;
  };
}

export interface ObjectJsonApiQuery {
  watch?: any;
  resourceVersion?: string;
  timeoutSeconds?: number;
  limit?: number; // doesn't work with ?watch
  continue?: string; // might be used with ?limit from second request
}

export class ObjectJsonApi extends JsonApi<ObjectJsonApiData> {
  protected parseError(
    error: ObjectJsonApiError | any,
    res: Response
  ): string[] {
    const {status, reason, message} = error;
    if (status && reason) {
      return [message || `${status}: ${reason}`];
    }
    return super.parseError(error, res);
  }
}
