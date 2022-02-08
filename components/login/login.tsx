import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoadingButton from '@mui/lab/LoadingButton';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import {styled, ThemeProvider} from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import Router from 'next/router';
import React from 'react';
import {connect} from '../../redux/decorator';
import {bindActionCreators} from 'redux';
import {objectWatchApi} from '../../client';
import {redux_userconfig} from '../../client/redux-store';
import {UserConfig} from '../../client/user-config';
import {clearUserConfig, setUserConfig} from '../../redux/user/action';
import {muiThemeStore} from '../../themes';
import Notifications from '../template/notification';

export function isLogin(): boolean {
  const userconfig = redux_userconfig();
  if (userconfig.token) {
    return true;
  }
  return false;
}

interface LoginProps {
  userconfig?: any;
  setUserConfig?: any;
  clearUserConfig?: any;
}

// redux props
const mapStateToProps = state => {
  return {
    userconfig: state.user?.userconfig || {},
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUserConfig: bindActionCreators(setUserConfig, dispatch),
    clearUserConfig: bindActionCreators(clearUserConfig, dispatch),
  };
};

// --------------- Login Form ---------------
function loginFetch(data: any, setUserConfig, clearUserConfig) {
  fetch('/user-login', {
    method: 'POST',
    body: JSON.stringify(data),
    cache: 'no-cache',
    headers: new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    }),
  }).then(async response => {
    if (response.status == 200) {
      // 清空 watch api 和 用户数据
      objectWatchApi.reset();
      clearUserConfig();
      // 录入用户数据
      const config: UserConfig = await response.json();
      setUserConfig(config);
      Notifications.ok('登录成功，等待跳转......', 500);
      setTimeout(() => Router.push('/'), 500);
    } else {
      Notifications.error('Login failed, please check username or password !');
    }
  });
}

@connect(mapStateToProps, mapDispatchToProps)
@observer
class LoginForm extends React.Component<LoginProps> {
  @observable showPassword: boolean = false;
  @observable isSubmitting: boolean = false;

  @observable username: string = '';
  @observable password: string = '';

  handleShowPassword = () => {
    this.showPassword = !this.showPassword;
  };

  login = () => {
    if (this.username && this.password) {
      this.isSubmitting = true;
      loginFetch(
        {username: this.username, password: this.password},
        this.props.setUserConfig,
        this.props.clearUserConfig
      );
      this.isSubmitting = false;
    } else {
      Notifications.info('用户名或密码不允许为空');
    }
  };

  onKeydown = (evt: React.KeyboardEvent<HTMLElement>) => {
    const {code} = evt.nativeEvent;
    if (code === 'Enter') {
      this.login();
    }
  };

  render() {
    const {onKeydown, showPassword, isSubmitting, login} = this;

    return (
      <div onKeyDown={onKeydown}>
        <Stack spacing={4}>
          <TextField
            fullWidth
            autoComplete='username'
            type='text'
            label='用户名'
            value={this.username}
            onChange={event => (this.username = event.target.value)}
          />
          <TextField
            fullWidth
            autoComplete='current-password'
            type={showPassword ? 'text' : 'password'}
            label='密码'
            value={this.password}
            onChange={event => (this.password = event.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={this.handleShowPassword} edge='end'>
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          sx={{my: 5}}
        >
          <LoadingButton
            fullWidth
            size='large'
            type='submit'
            variant='contained'
            onClick={login}
            loading={isSubmitting}
          >
            登录
          </LoadingButton>
        </Stack>
      </div>
    );
  }
}

// --------------- Login Layout ---------------
export default class LoginLayout extends React.Component<LoginProps> {
  render() {
    return (
      <ThemeProvider theme={muiThemeStore.theme}>
        <CssBaseline>
          <Container maxWidth='sm'>
            <ContentStyle>
              <Stack sx={{mb: 5}}>
                <Typography variant='h4' gutterBottom>
                  Vibap
                </Typography>
              </Stack>
              <LoginForm />
            </ContentStyle>
          </Container>
          <Notifications />
        </CssBaseline>
      </ThemeProvider>
    );
  }
}

const ContentStyle = styled('div')(({theme}) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));
