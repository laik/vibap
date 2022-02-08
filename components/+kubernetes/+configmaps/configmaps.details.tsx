import Divider from '@mui/material/Divider';
import {autorun, observable} from 'mobx';
import {disposeOnUnmount, observer} from 'mobx-react';
import React from 'react';
import {ColudObjectDetailsProps} from '../../../client';
import {DrawerItem} from '../../template/details/drawer/drawer-item';
import {DrawerItemLabels} from '../../template/details/drawer/drawer-item-labels';
import {ConfigMap} from './configmaps.store';

export interface DetailsProps extends ColudObjectDetailsProps {
  object: ConfigMap;
}

@observer
export default class Details extends React.Component<DetailsProps> {
  @observable isSaving = false;
  @observable data = observable.map();

  async componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        const {object: configMap} = this.props;
        if (configMap) {
          this.data.replace(configMap.data); // refresh
        }
      }),
    ]);
  }

  render() {
    const object = this.props.object;
    if (!object) {
      return null;
    }
    const data = Object.entries(this.data.toJSON());

    return (
      <>
        <Divider />
        <DrawerItem name={'Kind'}>{object.getKind()}</DrawerItem>
        <DrawerItem name={'Name'}>{object.getName()}</DrawerItem>
        <DrawerItem name={'Namespace'}>{object.getNs()}</DrawerItem>
        <DrawerItem name={'Uuid'}>{object.getId()}</DrawerItem>
        <DrawerItemLabels name={'Label'} labels={object.getLabels()} />
        {data.length > 0 && (
          <>
            <DrawerItem name={'Data'}></DrawerItem>
            {data.map(([name, value]) => {
              return (
                <div key={name}>
                  <DrawerItem name={name}>{value}</DrawerItem>
                </div>
              );
            })}
          </>
        )}
      </>
    );
  }
}
