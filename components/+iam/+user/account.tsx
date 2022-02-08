import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {accountStore} from '../+account/store';
import {apiManager} from '../../../client';
import {delay} from '../../template/form/fr';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {User, userStore} from './store';

const schema = {
  type: 'object',
  properties: {
    account: {
      title: '账户',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],
      disabled: false,
      size: 'small',
      default: '',

      color: 'info',
      fullWidth: true,
    },
  },
  labelWidth: 120,
  displayType: 'row',
};

@observer
export class AccountDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  @observable static data: User = null;
  subTitle = '绑定账户';

  schema = schema;
  maxWidth = 'md';

  static open(data: User) {
    AccountDialog.data = data;
    AccountDialog.ok = true;
  }

  close() {
    AccountDialog.ok = false;
  }

  @computed get isOpen() {
    return AccountDialog.ok;
  }

  @computed get object(): User {
    return AccountDialog.data;
  }

  onMount = form => {
    var account: string[] = [];
    const userConfig = apiManager.userConfig;
    accountStore.items
      // filter(object => object.getWorkspace() == userConfig.).
      .map(object => {
        account.push(object.getName());
      });

    delay(200).then(_ => {
      form.setSchemaByPath('account', {
        enum: account,
        enumNames: account,
      });
    });
  };

  in = () => {
    this.formData['account'] = this.object.spec.account;
  };

  out = () => {
    let formData = {};

    formData['metadata'] = {
      name: this.object.getName(),
      workspace: this.object.getNs(),
      tenant: this.object.getTenant(),
    };
    formData['spec'] = {
      account: this.formData['account'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    const object: Partial<User> = this.formData;
    userStore
      .update(this.object, object, {path: 'spec.account'})
      .then(() => {
        Notifications.ok(`${this.object.getName()} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
