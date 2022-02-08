import {apiManager} from '../../client';
import {userTypes} from './action';

const userConifgInitialState = {};

export default function reducer(state = userConifgInitialState, action) {
  switch (action.type) {
    case userTypes.SET:
      const config = {...state, ...action.userconfig};
      apiManager.updateUserConfig(config);
      return config;
    case userTypes.CLEAR:
      return {};
    default:
      return state;
  }
}
