import CloseIcon from '@mui/icons-material/Close';
import MuiSvgIcon from '@mui/material/SvgIcon';
import {observer} from 'mobx-react';
import React from 'react';
import {methodbind} from '../../../client/utils';
import {dockStore} from './dock.store';
import Box from '@mui/material/Box';
import {styled} from '@mui/system';
import {Typography} from '@mui/material';

export interface DockTabProps {
  moreActions?: React.ReactNode;
  tab: any;
  active?: string;
  disabled?: boolean;
  icon?: React.ReactElement;
  label?: React.ReactNode;
  children?: React.ReactNode;
  connecting: boolean;
}

@observer
export class DockTab extends React.Component<DockTabProps> {
  get tabId() {
    return this.props.tab.id; 
  }

  @methodbind()
  close() {
    dockStore.closeTab(this.tabId);
  }

  render() {
    const {moreActions, icon, connecting, ...tabProps} = this.props;
    const {title, pinned} = tabProps.tab;
    const {close} = this;
    return (
      <Box sx={{display: 'flex'}}>
        {connecting ? <SvgIcon>{icon}</SvgIcon> : icon}
        <Title noWrap aria-label={title}>
          {title}
        </Title>
        {moreActions}
        {!pinned && <CloseIcon fontSize='small' onClick={close} />}
      </Box>
    );
  }
}

const Title = styled(Typography)({
  width: '150px',
  fontSize: 'small',
  textTransform: 'none',
  align: 'center',
  marginLeft: 6,
  marginRight: 6,
});

const SvgIcon = styled(MuiSvgIcon)(({theme}) => ({
  fontSize: 'large',
  '@keyframes rotate-center': {
    from: {
      transform: 'rotate(0)',
    },
    to: {
      transform: 'rotate(1080deg)',
    },
  },
  animation: 'rotate-center 2s linear  infinite',
}));
