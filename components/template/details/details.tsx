import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import DialogContent from '@mui/material/DialogContent';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import {observer} from 'mobx-react';
import React from 'react';

interface Props {
  className: string;
  open: boolean;
  close(): void;
}

@observer
export class Details extends React.Component<Props> {

  private contentElem: HTMLElement;
  title: string;

  componentDidMount() {
    window.addEventListener('click', this.onClickOutside);
    window.addEventListener('keydown', this.onEscapeKey);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onClickOutside);
    window.removeEventListener('keydown', this.onEscapeKey);
  }

  onClickOutside = (evt: MouseEvent) => {
    const {contentElem, close} = this;
    const {className, open} = this.props;
    if (!open) {
      return;
    }
    if (evt.defaultPrevented || contentElem.contains(evt.target as Node)) {
      return;
    }
    const clickedElem = evt.target as HTMLElement;
    const isOutsideAnyDrawer = !clickedElem.closest(`.${className}`);
    if (isOutsideAnyDrawer) {
      close();
    }
  };

  onEscapeKey = (evt: KeyboardEvent) => {
    if (!this.props.open) {
      return;
    }
    if (evt.code === 'Escape') {
      this.close();
    }
  };

  close = () => {
    this.props.close();
  };

  closeButton = () => {
    return (
      <IconButton size='large' color='inherit' onClick={this.close}>
        <CloseIcon />
      </IconButton>
    );
  };

  bar = () => {
    return (
      <AppBar position='static'>
        <Toolbar variant='dense' disableGutters sx={{ ml: 2, mr: 1 }}>
          {/* title */}
          <Typography
            variant='h6'
            noWrap
            component='div'
            sx={{display: {xs: 'none', sm: 'block'}}}
          >
            {this.title || ''}
          </Typography>
          <Box sx={{flexGrow: 1}} />
          {this.closeButton()}
        </Toolbar>
      </AppBar>
    );
  };

  render() {
    const {open, className, children} = this.props;

    return (
      <Drawer
        open={open}
        className={`${className}`}
        anchor='right'
        variant={'persistent'}
        ref={e => (this.contentElem = e)}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        {this.bar()}
        <DialogContent sx={{p: 0, m: 0}}>{children}</DialogContent>
      </Drawer>
    );
  }
}

const Drawer = styled(MuiDrawer)(({theme}) => ({
  '& .MuiDrawer-paper': {
    width: 900,
    zIndex: 1200,
    boxShadow: `0 0 16px ${theme.palette.boxShadow} `,
  },
}));
