import createCache from '@emotion/cache';
import {CacheProvider} from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {useEffect} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {isLogin, larkLogin} from '../components/login';
import MainLayout from '../components/main/layout';
import wrapper from '../redux';

const queryString = require('query-string');
// Client-side cache, shared for the whole session of the user in the browser.
function createEmotionCache() {
  return createCache({key: 'css'});
}
const clientSideEmotionCache = createEmotionCache();

function App(props) {
  const {Component, emotionCache = clientSideEmotionCache, pageProps} = props;

  const islogin = isLogin();

  const router = useRouter(); // 路由
  const reduxDispatch = useDispatch(); // redux 触发器
  const store = useStore(); // redux store


  useEffect(() => {
    if (islogin) {
      // 已登录 跳转主页
      if (location.pathname == '/login') {
        router.push('/');
        return;
      }
    } else {
      // 后端 username password 登录页
      router.push('/login');
      return;
    }
  }, [islogin]);

  const loginPage = () => {
    // 登录页
    return (
      <div style={{overflow: 'auto'}}>
        <Component {...pageProps} />
      </div>
    );
  };

  const mainPage = () => {
    // 项目页
    return (
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    );
  };

  const page = () => {
    return !islogin ? loginPage() : mainPage();
  };


  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Vibap</title>
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width'
        />
      </Head>
      <PersistGate loading={null} persistor={store?.__persistor}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {page()}
      </PersistGate>
    </CacheProvider>
  );
}

export default wrapper.withRedux(App);
