import {computed, observable, reaction} from 'mobx';
import {disposeOnUnmount, observer} from 'mobx-react';
import { NextRouter } from 'next/router';
import { withRouter } from '../../withRouter';
import React from 'react';
import {ObjectApi} from '../../../client';
import {ApiComponents, apiManager} from '../../../client/api-manager';
import {Details} from './details';

interface RouterProps {
  router?: NextRouter;
}

@withRouter
@observer
export default class CloudObjectDetails extends React.Component<RouterProps> {
  @observable isLoading = false;
  @observable.ref loadingError: React.ReactNode;

  close = () => {
    this.props.router.push({query: {}});
  };

  @computed get path(): string {
    const details = this.props.router.query.details;
    if (details && typeof details == 'string') {
      return details;
    }
    return '';
  }

  @computed get object() {
    const store = apiManager.getStore(this.path, true);
    if (store) {
      const {name, namespace} = ObjectApi.parseApi(this.path);
      return store.getByPath(name, namespace);
    }
  }

  @disposeOnUnmount
  loader = reaction(
    () => [
      this.path,
      this.object, // resource might be updated via watch-event or from already opened details
    ],
    async () => {
      this.loadingError = '';
      const {path, object} = this;
      if (!object) {
        const store = apiManager.getStore(path);
        if (store) {
          this.isLoading = true;
          try {
            await store.loadFromPath(path);
          } catch (err) {
            this.loadingError = `
                Resource loading has failed: <b>{err.toString()}</b>
              `;
          } finally {
            this.isLoading = false;
          }
        }
      }
    }
  );

  render() {
    const {object, isLoading, loadingError, close} = this;
    let isOpen = !!(object || isLoading || loadingError);
    let apiComponents: ApiComponents;
    if (object) {
      apiComponents = apiManager.getViews(this.path);
    }

    return (
      <Details open={isOpen} className='CloudObjectDetails' close={close}>
        {apiComponents && apiComponents.Details && (
          <apiComponents.Details object={object} />
        )}
      </Details>
    );
  }
}
