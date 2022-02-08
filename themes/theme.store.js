import {createTheme} from '@mui/material';
import {action, observable, toJS} from 'mobx';
import {themeStore} from '../components/+system/+theme/store';
import defaultTheme, {themeOptions} from './theme';

class MuiThemeStore {
  @observable theme = defaultTheme;
  @observable options = themeOptions;

  constructor() {
    this.setTheme();
  }

  @action
  async setPaletteMode(palette) {
    this.options.palette.mode = palette;
    this.setTheme();
  }

  @action
  async setTheme() {
    this.theme = createTheme(this.options);
    // console.log('this.theme', toJS(this.theme));
  }

  @action
  async changeTheme(name) {
    if (name == 'default') {
      this.theme = defaultTheme;
      this.setTheme();
      return;
    }
    const themes = themeStore.items.filter(item => item.getName() == name);
    if (themes.length > 0) {
      let t = this.theme;
      this.theme = Object.assign(t, themes[0].getMui());
      this.setTheme();
    }
  }
}

export const muiThemeStore = new MuiThemeStore();
