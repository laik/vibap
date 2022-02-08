import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Popover from '@mui/material/Popover';
import { useTheme } from '@mui/material/styles';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { themeStore } from '../+system/+theme/store';
import { changeTheme, setPaletteDark } from '../../redux/themes/action';
import { SectionDesktop } from './mobile-section';

// 黑白色主题 切换
export function PaletteMode() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const toggleColorMode = event => {
    const mode = theme.palette.mode === 'light' ? 'dark' : 'light';
    dispatch(setPaletteDark(mode));
  };
  return (
    <SectionDesktop>
      <IconButton sx={{ml: 1}} onClick={toggleColorMode} color='inherit'>
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
      </IconButton>
    </SectionDesktop>
  );
}

// 主题选择器
interface ThemeMenuProps {
  theme?: any;
  changeTheme?: any;
}


// TODO: 主题后面移到userConfig里，不要在用户的数据请求里带系统的配置
@observer
class ThemeMenu extends React.Component<ThemeMenuProps> {
  themePickerId = 'theme-button';
  @observable themePickerAnchorEl: HTMLElement = null;

  componentDidMount(): void {
    // themeStore.loadAll(); // remove the theme load
  }

  isthemePickerOpen = () => Boolean(this.themePickerAnchorEl);
  handleThemePickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    this.themePickerAnchorEl = event.currentTarget;
  };

  handleTimePickerClose = () => {
    this.themePickerAnchorEl = null;
  };

  setTheme = name => {
    const {changeTheme} = this.props;
    changeTheme(name);
  };

  renderThemePicker = () => {
    const {theme} = this.props;

    return (
      <Popover
        id={this.themePickerId}
        anchorEl={this.themePickerAnchorEl}
        open={this.isthemePickerOpen()}
        onClose={this.handleTimePickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <List dense>
          <ListItem>
            <Button
              variant={theme === 'default' ? 'outlined' : 'contained'}
              onClick={() => this.setTheme('default')}
            >
              Default
            </Button>
          </ListItem>
          {themeStore.items.map(item => (
            <ListItem key={item.getName()}>
              <Button
                variant={theme === item.getName() ? 'outlined' : 'contained'}
                onClick={() => this.setTheme(item.getName())}
              >
                {item.getName()}
              </Button>
            </ListItem>
          ))}
        </List>
      </Popover>
    );
  };

  render() {
    const {renderThemePicker, handleThemePickerOpen} = this;
    return (
      <>
        <SectionDesktop>
          <IconButton
            aria-describedby={this.themePickerId}
            color='inherit'
            onClick={handleThemePickerOpen}
          >
            <CatchingPokemonIcon />
          </IconButton>
        </SectionDesktop>
        {renderThemePicker()}
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    theme: state.theme?.theme || '',
  };
};
const mapDispatchToProps = dispatch => {
  return {
    changeTheme: bindActionCreators(changeTheme, dispatch),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ThemeMenu);
