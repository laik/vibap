import {createWrapper, HYDRATE} from 'next-redux-wrapper';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {persistReducer, persistStore} from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
// reducer
import menu from './menu/reducer';
import storage from './sync_storage';
import theme from './themes/reducer';
import user from './user/reducer';

// redux 持久化
const bindMiddleware = middleware => {
  if (process.env.NODE_ENV !== 'production') {
    const {composeWithDevTools} = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const combinedReducer = combineReducers({
  user,
  menu,
  theme,
});

export const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    if (state.count.count) nextState.count.count = state.count.count; // preserve count value on client side navigation
    return nextState;
  } else {
    return combinedReducer(state, action);
  }
};

const initStore = () => {
  const persistConfig = {
    key: 'nextjs',
    whitelist: ['user', 'menu', 'theme'], // only counter will be persisted, add other reducers if needed
    storage, // if needed, use a safer storage
  };
  const persistedReducer = persistReducer(persistConfig, reducer);
  const store = createStore(
    persistedReducer,
    bindMiddleware([thunkMiddleware])
  );

  store.__persistor = persistStore(store);

  return store;
};

export const reduxStore = initStore;

export const wrapper = createWrapper(reduxStore, {debug: false});
