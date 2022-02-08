import { debounce } from 'lodash';
import Notifications from '../components/template/notification';
import { JsonApiErrorParsed } from './json-api';

export * from './api-manager';
export * from './item.store';
export * from './json-api';
export * from './object';
export * from './object-api';
export * from './object-json-api';
export * from './object-watch-api';
export * from './object.store';
export * from './websocket-api';


const de_showMessage = debounce(showMessage, 800);
function showMessage(msg: string) {
    Notifications.error(msg);
}

// Common handler for HTTP api errors
export function onApiError(error: JsonApiErrorParsed, res: Response) {
    switch (res.status) {
        case 403:
            error.isUsedForNotification = true;
            Notifications.error(error);
            break;
        case 500:
            de_showMessage('500 Internal Server Error(内部服务器错误)');
            break;
        case 502:
            de_showMessage('502 Bad Gateway(网关错误)')
            break;
    }
}