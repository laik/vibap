import React from 'react';
import {styled} from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {FirstLevelMenu} from '../menu';
import {Logo} from '../header/headerbar';

interface SidebarProps {
  float: boolean;
  open: boolean;
  onClose: () => void;
  onFloatOpen: () => void;
  onFloatClose: () => void;
}

const sidebar_float_style = {
  border: '1px solid rgb(222,224,227)', //
  height: '700px',
  filter: 'drop-shadow(0px 6px 24px rgba(31,35,41, 0.08))', //
  boxShadow: '0px 0px 1px 0px rgba(31,35,41, 0.12)', //
  width: '320px',
};

const Sidebar: React.FC<SidebarProps> = ({
  open,
  float,
  onClose,
  onFloatOpen,
  onFloatClose,
}) => {
  return (
    <Main
      className={open ? 'menu-open' : ''}
      onMouseEnter={onFloatOpen}
      onMouseLeave={onFloatClose}
      sx={
        open
          ? {
              ...sidebar_float_style,
              opacity: 1,
              transform: 'translate(0px, 0px)',
              border: 'none',
              height: '100%',
              filter: 'none',
              boxShadow: 'none',
              borderRight: '1px solid var(--vale-line-divider-default)',
            }
          : float
          ? {
              ...sidebar_float_style,
              opacity: 1,
              transform: 'translate(0px, var(--vale-nav-height))',
            }
          : {
              ...sidebar_float_style,
              opacity: 0,
              transform: 'translate(-320px, var(--vale-nav-height))',
            }
      }
    >
      {open && (
        <div
          style={{
            width: '100%',
            height: 'var(--vale-nav-height)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Logo />
          <SidebarHide className='menu-hide-btn'>
            <SidebarHideIcon onClick={onClose} />
          </SidebarHide>
        </div>
      )}
      <FirstLevelMenu />
    </Main>
  );
};

const SidebarHideIcon = styled(ChevronLeftIcon)(({theme}) => {
  const color = theme.palette.primary[theme.palette.mode];
  return {
    fontSize: '18px',
    color: 'rgb(100, 106, 115)',
    '&:hover': {
      color,
    },
  };
});

const SidebarHide = styled('div')(({theme}) => ({
  WebkitBoxPack: 'center',
  justifyContent: 'center',
  WebkitBoxAlign: 'center',
  alignItems: 'center',
  width: '17px',
  height: '36px',
  borderRadius: '8px 0px 0px 8px',
  border: '1px solid rgb(222,224,247)',
  borderRight: 'none',
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  right: '0px',
  zIndex: '89',
  boxShadow: '0px 2px 4px 0px rgba(31,35,41,0.12)',
  backgroundColor: '#fff',
  cursor: 'pointer',
  display: 'none',
}));

const Main = styled('div')(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  willChange: 'auto',
  backgroundColor: '#fff', //
  position: 'absolute',
  zIndex: theme.zIndex.speedDial,
  transition:
    'opacity 0.3s cubic-bezier(0, 0.02, 0.21, 1.01) 0s, transform 0.3s cubic-bezier(0, 0.69, 0.71, 1) 0s',
  '&.menu-open:hover': {
    '& .menu-hide-btn': {
      display: 'flex',
    },
  },
}));

export default Sidebar;
