import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import isObject from 'lodash/isObject';
import uniqueId from 'lodash/uniqueId';
import {action, observable, reaction} from 'mobx';
import {disposeOnUnmount, observer} from 'mobx-react';
import React from 'react';

// ----------------------- Notifications Store -----------------------

export type IMessageId = string | number;
export type IMessage = React.ReactNode | React.ReactNode[];

export interface INotification {
  id?: IMessageId;
  message: IMessage;
  status?: 'success' | 'error' | 'info';
  timeout?: number;
}

export class NotificationsStore {
  public notifications = observable<INotification>([], {deep: false});
  protected autoHideTimers = new Map<IMessageId, number>();

  addAutoHideTimer(notification: INotification) {
    this.removeAutoHideTimer(notification);
    const {id, timeout} = notification;
    if (timeout) {
      const timer = window.setTimeout(() => this.remove(id), timeout);
      this.autoHideTimers.set(id, timer);
    }
  }

  removeAutoHideTimer(notification: INotification) {
    const {id} = notification;
    if (this.autoHideTimers.has(id)) {
      clearTimeout(this.autoHideTimers.get(id));
      this.autoHideTimers.delete(id);
    }
  }

  @action
  add(notification: INotification) {
    if (!notification.id) {
      notification.id = uniqueId('notification_');
    }
    const index = this.notifications.findIndex(
      item => item.id === notification.id
    );
    if (index > -1) this.notifications.splice(index, 1, notification);
    else this.notifications.push(notification);
    this.addAutoHideTimer(notification);
  }

  @action
  remove(itemOrId: IMessageId | INotification) {
    if (!isObject(itemOrId)) {
      itemOrId = this.notifications.find(item => item.id === itemOrId);
    }
    return this.notifications.remove(itemOrId as INotification);
  }
}

export const notificationsStore = new NotificationsStore();

// ----------------------- Notifications -----------------------

@observer
export default class Notifications extends React.Component {
  public elem: HTMLElement;

  static ok(message: IMessage, timeout = 2000) {
    notificationsStore.add({
      message: message,
      timeout: timeout,
      status: 'success',
    });
  }

  static error(message: IMessage, timeout = 5000) {
    notificationsStore.add({
      message: message,
      timeout: timeout,
      status: 'error',
    });
  }

  static info(message: IMessage, timeout = 3000) {
    return notificationsStore.add({
      message: message,
      timeout: timeout,
      status: 'info',
    });
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(
        () => notificationsStore.notifications.length,
        () => {
          this.scrollToLastNotification();
        },
        {delay: 250}
      ),
    ]);
  }

  scrollToLastNotification = () => {
    if (!this.elem) {
      return;
    }
    this.elem.scrollTo({
      top: this.elem.scrollHeight,
      behavior: 'smooth',
    });
  };

  getMessage(notification: INotification) {
    let {message} = notification;
    if (message) {
      message = message.toString();
    }
    return React.Children.toArray(message);
  }

  handleClose = (id: IMessageId) => {
    notificationsStore.remove(id);
  };

  render() {
    const {notifications} = notificationsStore;
    const {handleClose, getMessage} = this;

    return (
      <div>
        {notifications.map(notification => {
          return (
            <Snackbar
              key={notification.id}
              open={true}
              autoHideDuration={notification.timeout}
            >
              <Alert
                severity={notification.status}
                sx={{width: '100%'}}
                elevation={6}
                onClose={() => handleClose(notification.id)}
              >
                {getMessage(notification)}
              </Alert>
            </Snackbar>
          );
        })}
      </div>
    );
  }
}
