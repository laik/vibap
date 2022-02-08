import {muiThemeStore} from '../../themes';
import {themeTypes} from './action';

const themeInitialState = {
  palettemode: 'light',
  theme: '',
};

export default function reducer(state = themeInitialState, action) {
  switch (action.type) {
    case themeTypes.PaletteMode:
      muiThemeStore.setPaletteMode(action.mode);
      return {...state, palettemode: action.mode};
    case themeTypes.ChangeTheme:
      muiThemeStore.changeTheme(action.name);
      return {...state, theme: action.name};
    default:
      return state;
  }
}
