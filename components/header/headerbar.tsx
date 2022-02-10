import AutoAwesomeMosaicOutlinedIcon from '@mui/icons-material/AutoAwesomeMosaicOutlined';
import FaceRetouchingNaturalTwoToneIcon from '@mui/icons-material/FaceRetouchingNaturalTwoTone';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
// import MenuIcon from '@mui/icons-material/Menu';
// import AppBar from '@mui/material/AppBar';
// import Button from '@mui/material/Button';
// import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
// import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react';
import Link from 'next/link';
import React from 'react';
import UserMenu from './user';
import WorkSpaces from './workspace';

const Gorw = styled('div')(({theme}) => ({
  flexGrow: 1,
}));

const LogoMain = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  cursor: 'pointer',
}));

const LogoIcon = styled(FaceRetouchingNaturalTwoToneIcon)(({theme}) => ({
  color: theme.palette.primary.main,
}));

const ToolbarLeft = styled('div')(({theme}) => ({
  display: 'flex',
  // justifyContent: 'space-between',
  alignItems: 'center',
  width: 'var(--vale-subSidebar-width)',
  // paddingLeft: '40px',
}));

const ToolbarRight = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  paddingRight: '12px',
}));

const Title = styled(Typography)(({theme}) => ({
  marginLeft: 5,
  color: theme.palette.text.primary,
}));

const EntryIcon = styled('div')(({theme}) => ({
  '& .autoAwesomeMosaicIcon': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '& .keyboardDoubleArrowRightIcon': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

@observer
export default class HeaderBar extends React.Component<{
  float: boolean;
  open: boolean;
  onOpen: () => void;
  onFloatOpen: () => void;
  onFloatClose: () => void;
}> {
  funcGroup = () => {
    return (
      <>
        <WorkSpaces />
        {/* <ThemeMenu />
        <PaletteMode /> */}
      </>
    );
  };

  render() {
    const {open, onOpen, float, onFloatOpen, onFloatClose} = this.props;
    return (
      <>
        <AppBar>
          <ToolbarLeft>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingLeft: '8px',
                height: 'var(--vale-nav-height)',
                cursor: 'pointer',
              }}
            >
              <EntryIcon
                onMouseEnter={onFloatOpen}
                onMouseLeave={onFloatClose}
                onClick={onOpen}
              >
                {float ? (
                  <span className='keyboardDoubleArrowRightIcon'>
                    <KeyboardDoubleArrowRightIcon />
                  </span>
                ) : (
                  <span className='autoAwesomeMosaicIcon'>
                    <AutoAwesomeMosaicOutlinedIcon />
                  </span>
                )}
              </EntryIcon>
            </div>
            <Logo>
              <LogoIcon sx={{color: '#295dfa'}} />
              <Title variant='h5'>云平台</Title>
            </Logo>
          </ToolbarLeft>
          {/* {this.title()} */}
          <Gorw />
          <ToolbarRight>
            {this.funcGroup()}
            <UserMenu />
          </ToolbarRight>
        </AppBar>
      </>
    );
  }
}

export const Logo: React.FC = () => {
  return (
    <Link href='/' passHref>
      <LogoMain>
        <FaceRetouchingNaturalTwoToneIcon sx={{color: '#295dfa'}} />
        <Title variant='h5'>云平台</Title>
      </LogoMain>
    </Link>
  );
};

const AppBar = styled('div')(({theme}) => ({
  display: 'flex',
  position: 'fixed',
  top: 0,
  right: 0,
  left: 0,
  // zIndex: theme.zIndex.drawer,
  backgroundColor: '#fff',
  height: 'var(--vale-nav-height)',
  borderBottom: '1px solid var(--vale-line-divider-default)',
  zIndex: theme.zIndex.speedDial - 1,
}));
