import Divider from '@mui/material/Divider';
import { observer } from 'mobx-react';
import React from 'react';
import { Region } from '../+region/store';
import { ColudObjectDetailsProps } from '../../../client';
import { DrawerItem } from '../../template/details/drawer/drawer-item';
import { DrawerItemLabels } from '../../template/details/drawer/drawer-item-labels';


export interface DetailsProps extends ColudObjectDetailsProps {
  object: Region;
}

@observer
export default class Details extends React.Component<DetailsProps> {
  render() {
    const object = this.props.object;
    if (!object) {
      return null;
    }
    return (
      <>
        <Divider />
        <DrawerItem name={'Kind'}>{object.getKind()}</DrawerItem>
        <DrawerItem name={'Name'}>{object.getName()}</DrawerItem>
        <DrawerItem name={'Workspaces'}>{object.getWorkspace()}</DrawerItem>
        <DrawerItem name={'Namespace'}>{object.getNamespace()}</DrawerItem>
        <DrawerItem name={'Uuid'}>{object.getId()}</DrawerItem>
        <DrawerItemLabels name={'Label'} labels={object.getLabels()} />
      </>
    );
  }
}
