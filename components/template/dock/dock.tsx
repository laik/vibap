import Box from '@mui/material/Box';
import {grey} from '@mui/material/colors';
import MuiDrawer from '@mui/material/Drawer';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import {styled} from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import throttle from 'lodash/throttle';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {dockStore, IDockTab} from './dock.store';

@observer
export class Dock extends React.Component {
  componentDidMount() {
    this.mounted = true;
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.onDragEnd);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.onDragEnd);
  }

  @observable mounted: boolean = false;

  @observable inited: boolean = false;
  @observable changed: boolean = false;
  @observable initY: number;
  @observable pageY: number;
  @observable offsetY: number = 0;

  onResizeStart = () => {
    const {isOpen, open, setHeight, minHeight} = dockStore;
    if (!isOpen) {
      open();
      setHeight(minHeight);
    }
  };

  onResize = offsetY => {
    const {isOpen, height, setHeight, minHeight, defaultHeight, resetSizeTip} =
      dockStore;
    const newHeight = height + offsetY;
    if (height > newHeight && newHeight < minHeight) {
      setHeight(defaultHeight);
    } else if (isOpen) {
      setHeight(newHeight);
    }
    resetSizeTip();
  };

  onDragInit = (evt: React.MouseEvent<any>) => {
    const {pageY} = evt;
    this.inited = true;
    this.initY = pageY;
    this.pageY = pageY;
  };

  onDrag = throttle((evt: MouseEvent) => {
    const {inited, pageY} = this;
    const offsetY = pageY - evt.pageY;
    let changed = false;
    if (offsetY !== 0) changed = true;
    if (inited && changed) {
      const start = !this.changed;
      this.changed = true;
      this.pageY = evt.pageY;
      this.offsetY = offsetY;
      if (start) this.onResizeStart();
      this.onResize(this.offsetY);
    }
  }, 10);

  onDragEnd = (evt: MouseEvent) => {
    const {pageY} = evt;
    const {inited, changed, initY} = this;
    if (inited) {
      if (!changed) return;
      this.offsetY = initY - pageY;
    }
    this.inited = false;
  };

  onClose = () => {
    const {close, reset} = dockStore;
    close();
    reset();
  };

  onFullSize = () => {
    const {toggleFillSize} = dockStore;
    toggleFillSize();
  };

  onMiniSize = () => {
    const {toggleMinSize} = dockStore;
    toggleMinSize();
  };

  onKeydown = (evt: React.KeyboardEvent<HTMLElement>) => {
    const {close, closeTab, selectedTab} = dockStore;
    if (!selectedTab) return;
    const {code, ctrlKey, shiftKey} = evt.nativeEvent;
    if (shiftKey && code === 'Escape') {
      close();
    }
    if (ctrlKey && code === 'KeyW') {
      if (selectedTab.pinned) close();
      else closeTab(selectedTab.id);
    }
  };

  onChangeTab = (event, tab: IDockTab) => {
    const {open, selectTab} = dockStore;
    open();
    selectTab(tab.id);
  };

  renderTab = (tab: IDockTab) => {
    if (this.mounted) {
      const TerminalTab = require('./terminal/terminal-tab').default;
      const isTerminalTab = require('./terminal/terminal').isTerminalTab;
      return (
        isTerminalTab(tab) && (
          <Tab
            disableFocusRipple
            disableRipple
            label={<TerminalTab tab={tab} />}
            value={tab}
          />
        )
      );
    }
  };

  renderTabContent = () => {
    const {isOpen, height, selectedTab: tab} = dockStore;
    if (!isOpen || !tab) return;
    if (this.mounted) {
      const TerminalWindow = require('./terminal/terminal-windows').default;
      const isTerminalTab = require('./terminal/terminal').isTerminalTab;
      return (
        <div>
          {isTerminalTab(tab) && (
            <TerminalWindow tab={tab} height={height - 65} />
          )}
        </div>
      );
    }
  };

  render() {
    const {
      onChangeTab,
      renderTab,
      renderTabContent,
      onKeydown,
      onDragInit,
      onClose,
      onFullSize,
      onMiniSize,
    } = this;
    const {
      isOpen,
      height,
      tabs,
      fullSize,
      miniSize,
      selectedTab: tab,
    } = dockStore;

    return (
      <Drawer
        open={isOpen}
        onKeyDown={onKeydown}
        variant={isOpen ? 'persistent' : 'temporary'}
        anchor='bottom'
        sx={{
          display: 'flex',
          '& .MuiDrawer-paper': {
            height: height,
            overflowY: 'hidden',
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <StyledBox onMouseDown={onDragInit}>
          <Puller />
        </StyledBox>
        <Box sx={{display: 'flex', borderBottom: 1, borderColor: 'divider'}}>
          <Tabs
            value={tab}
            variant='scrollable'
            scrollButtons='auto'
            sx={{
              width: '94%',
              '.MuiTabs-scrollButtons.Mui-disabled': {opacity: 0.3},
            }}
            onChange={onChangeTab}
          >
            {tabs.map(tab => renderTab(tab))}
          </Tabs>
          {/* 最小化 */}
          <Box>
            <IconButton
              disableFocusRipple
              disableRipple
              size='small'
              onClick={onMiniSize}
            >
              <Icon baseClassName='material-icons-outlined' fontSize='inherit'>
                {miniSize ? `expand_less` : `expand_more`}
              </Icon>
            </IconButton>
          </Box>
          {/* 全屏 */}
          <Box>
            <IconButton
              disableFocusRipple
              disableRipple
              size='small'
              onClick={onFullSize}
            >
              <Icon baseClassName='material-icons-outlined' fontSize='inherit'>
                {fullSize ? `fullscreen_exit` : `fullscreen`}
              </Icon>
            </IconButton>
          </Box>

          {/* 关闭 */}
          <Box>
            <IconButton
              disableFocusRipple
              disableRipple
              size='small'
              onClick={onClose}
            >
              <Icon baseClassName='material-icons-outlined' fontSize='inherit'>
                close
              </Icon>
            </IconButton>
          </Box>
        </Box>
        {renderTabContent()}
      </Drawer>
    );
  }
}

const StyledBox = styled(Box)(({theme}) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
  padding: theme.spacing(1),
  cursor: 'row-resize',
}));

const Puller = styled(Box)(({theme}) => ({
  width: 25,
  height: 4,
  backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
  borderRadius: 2,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
  cursor: 'pointer',
}));

const Drawer = styled(MuiDrawer)(({theme}) => ({
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
}));
