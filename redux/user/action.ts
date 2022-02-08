export const userTypes = {
  SET: 'SET',
  CLEAR: 'CLEAR',
};

export const setUserConfig = userconfig => dispatch => {
  return dispatch({type: userTypes.SET, userconfig: userconfig});
};

export const clearUserConfig = () => dispatch => {
  return dispatch({type: userTypes.CLEAR});
};
