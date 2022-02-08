import {menuTypes} from './action';

const menuInitialState = {
  lockedMenu: [],
  expandMenu: [],
  fixedMenu: [],
};

export default function reducer(state = menuInitialState, action) {
  switch (action.type) {
    // 第三层 展开
    case menuTypes.expandThirdLayer:
      state.expandMenu = state.expandMenu || [];
      if (!state.expandMenu.includes(action.name)) {
        state.expandMenu.push(action.name);
      } else {
        const indexOf = state.expandMenu.indexOf(action.name);
        state.expandMenu.splice(indexOf, 1);
      }
      return {...state, expandMenu: state.expandMenu};
    // 关闭 第三层展开
    case menuTypes.clearExpandMenu:
      return {...state, expandMenu: []};
    // 固定菜单
    case menuTypes.pinMenu:
      state.fixedMenu = state.fixedMenu || [];
      const indexOf = state.fixedMenu.findIndex(
        item => item.nodeName == action.fixedNode.nodeName
      );
      if (indexOf !== -1) {
        state.fixedMenu.splice(indexOf, 1);
      } else {
        state.fixedMenu.push(action.fixedNode);
      }
      return {...state, fixedMenu: state.fixedMenu};
    // 打开或者关闭侧边栏
    case menuTypes.open:
      return {...state, open: action.open};
    default:
      return state;
  }
}
