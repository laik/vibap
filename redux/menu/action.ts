export const menuTypes = {
  expandThirdLayer: 'expandThirdLayer',
  clearExpandMenu: 'clearExpandMenu',
  pinMenu: 'pinMenu',
  open: 'open',
};


export const expandThirdLayer = (name: string) => dispatch => {
  return dispatch({type: menuTypes.expandThirdLayer, name: name});
};

export const clearExpandMenu = () => dispatch => {
  return dispatch({type: menuTypes.clearExpandMenu});
};

export const pinMenu = (fixedNode: {nodeName, branchLink, node}) => dispatch => {
  return dispatch({type: menuTypes.pinMenu, fixedNode: fixedNode});
};

export const setOpen = (o: boolean) => dispatch => {
  return dispatch({type: menuTypes.open, open: o});
};
