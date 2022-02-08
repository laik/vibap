import React, {useState, useCallback, useRef} from 'react';
import {styled} from '@mui/material/styles';
import HeaderBar from '../header/headerbar';
import Sidebar from './sidebar';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  expandThirdLayer,
  setOpen,
} from '../../redux/menu/action';

interface AppProps {
  open?: boolean;
  setOpen?: (o: boolean) => void;
}

const mapStateToProps = state => {
  return {
    reduxMenus: state.user?.menus || [],
    thirdLayers: state.menu?.thirdLayers || [],
    open: state.menu?.open || false,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    expandThirdLayer: bindActionCreators(expandThirdLayer, dispatch),
    setOpen: bindActionCreators(setOpen, dispatch),
  };
};

const App: React.FC<AppProps> = ({open, setOpen, children, ...rest}) => {
  const timerRef = useRef(null);
  const [float, setFloat] = useState<boolean>(false);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onFloatOpen = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFloat(true);
  }, []);

  const onFloatClose = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setFloat(false);
    }, 300);
  }, []);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        <Placeholder
          sx={{
            width: open ? '320px' : 0,
          }}
        ></Placeholder>
        <Sidebar
          float={float}
          open={open}
          onClose={onClose}
          onFloatOpen={onFloatOpen}
          onFloatClose={onFloatClose}
        />
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            WebkitBoxOrient: 'vertical',
            WebkitBoxDirection: 'normal',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <HeaderBar
            open={open}
            float={float}
            onOpen={onOpen}
            onFloatOpen={onFloatOpen}
            onFloatClose={onFloatClose}
          />
          <Main>{children}</Main>
        </div>
      </div>
    </div>
  );
};

const Placeholder = styled('div')(({theme}) => ({
  backgroundColor: 'rgb(245,246,247)', //
  height: '100%',
  flexShrink: 0,
  willChange: 'width',
  WebkitBoxFlex: 0,
  flexGrow: 0,
  transition: 'width 0.2s cubic-bezier(0, 1, 0.39, 0.99) 0s',
}));

const Main = styled('main')(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  marginTop: 'var(--vale-nav-height)',
  backgroundColor: 'var(--vale-main-background-color)',
  padding: 'var(--vale-main-padding)',
  paddingBottom: 0,
}));

export default connect(mapStateToProps, mapDispatchToProps)(App);
