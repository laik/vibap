import Icon from '@mui/material/Icon';
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react';
interface DrawerParamTogglerProps {
  label: string | number;
}

@observer
export class DrawerParamToggler extends React.Component<DrawerParamTogglerProps> {
  @observable open: boolean = false;

  toggle = () => {
    this.open = !this.open;
  };

  render() {
    const {label, children} = this.props;
    const icon = `arrow_drop_${this.open ? 'up' : 'down'}`;
    const link = this.open ? `Hide` : `Show`;
    return (
      <>
        <div className='flex gaps align-center'>
          <div style={{flexGrow: 2}}>{label}</div>
          <div style={{cursor: 'pointer'}} onClick={this.toggle}>
            <span className='param-link-text'>{link}</span>
            <Icon baseClassName='material-icons-outlined'>{icon}</Icon>
          </div>
        </div>
        <div style={{display: this.open ? 'block' : 'none'}}>{children}</div>
      </>
    );
  }
}
