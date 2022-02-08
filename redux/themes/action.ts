export const themeTypes = {
  PaletteMode: 'PaletteMode',
  ChangeTheme: 'ChangeTheme',
};

export const setPaletteDark =
  (mode: string = 'light') =>
  dispatch => {
    return dispatch({type: themeTypes.PaletteMode, mode});
  };

export const changeTheme = (name: string) => dispatch => {
  return dispatch({type: themeTypes.ChangeTheme, name: name});
};
