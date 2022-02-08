import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {observer} from 'mobx-react';
import React from 'react';
import {muiThemeStore} from '../../themes';
import CloudObjectDetails from '../template/details/cloud-object-details';
import {Dock} from '../template/dock/dock';
import Notifications from '../template/notification';
import App from './app';
@observer
export default class MainLayout extends React.Component {
  render() {
    const {children} = this.props;

    return (
      <ThemeProvider theme={muiThemeStore.theme}>
        <CssBaseline>
          <App>{children}</App>
          <Dock />
          <CloudObjectDetails />
          <Notifications />
        </CssBaseline>
      </ThemeProvider>
    );
  }
}
