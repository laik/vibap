import React from 'react';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import RefreshIcon from '@mui/icons-material/Refresh';
import LoopIcon from '@mui/icons-material/Loop';
import {methodbind} from '../../../../client/utils';
import {terminalStore} from './terminal.store';
import {dockStore} from '../dock.store';
import {DockTab, DockTabProps} from '../dock-tab';
import {observer} from 'mobx-react';
import {observable} from 'mobx';

@observer
export default class TerminalTab extends React.Component<DockTabProps> {
  @observable connecting = false;

  get tabId() {
    return this.props.tab.id;
  }

  get isDisconnected() {
    return terminalStore.isDisconnected(this.tabId);
  }

  close() {
    dockStore.closeTab(this.tabId);
  }

  @methodbind()
  reconnect() {
    terminalStore.reconnect(this.tabId);
  }

  render() {
    let {reconnect, connecting} = this;
    let tabIcon = connecting ? <LoopIcon /> : <KeyboardIcon fontSize='small' />;

    return (
      <DockTab
        {...this.props}
        connecting={connecting}
        icon={tabIcon}
        moreActions={
          this.isDisconnected && (
            <RefreshIcon fontSize='small' onClick={reconnect} />
          )
        }
      />
    );
  }
}
