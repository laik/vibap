import {observer} from 'mobx-react';
import React from 'react';
import {ColudObjectDetailsProps} from '../../../client';
import {DrawerItem, DrawerItemLabels} from '../../template/details/drawer';
import {Account} from './store';

export interface DetailsProps extends ColudObjectDetailsProps {
  object: Account;
}

@observer
export default class Details extends React.Component<ColudObjectDetailsProps> {
  render() {
    const object = this.props.object;
    if (!object) {
      return null;
    }
    return (
      <>
        <DrawerItem name={'Kind'}>{object.getKind()}</DrawerItem>
        <DrawerItem name={'Name'}>{object.getName()}</DrawerItem>
        <DrawerItem name={'Worksapce'}>{object.getNs()}</DrawerItem>
        <DrawerItem name={'Uuid'}>{object.getId()}</DrawerItem>
        <DrawerItemLabels name={'Label'} labels={object.getLabels()} />
      </>
    );
  }
}
