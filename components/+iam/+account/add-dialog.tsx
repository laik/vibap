import {merge} from 'lodash';
import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {userStore} from '../+user/store';
import {tenantStore} from '../../+system/+tenant/store';
import {redux_userconfig} from '../../../client/redux-store';
import {UserConfig} from '../../../client/user-config';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {Account, accountStore} from './store';

let schema = {
  type: 'object',
  displayType: 'row',
  labelWidth: 120,
  properties: {
    tenant: {
      title: '租户',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],
      disabled: false,
      size: 'small',
      default: '',

      color: 'info',
      fullWidth: true,
      required: true,
    },
    user: {
      title: '租户用户',
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
};

const accounttype = {
  properties: {
    accounttype: {
      title: '用户类型',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

      size: 'small',
      required: true,
      disabled: false,
      default: '',
      color: 'info',
      fullWidth: true,
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  inTrigger = true;
  userconfig = redux_userconfig();
  tmpSchema =
    this.userconfig.roleType === 3 ? merge(schema, accounttype) : schema;
  schema = this.tmpSchema;

  subTitle = '添加帐户';

  static open() {
    AddDialog.ok = true;
  }

  close() {
    AddDialog.ok = false;
  }

  @computed get isOpen() {
    return AddDialog.ok;
  }

  in = () => {
    this.formData = {
      tenant: this.userconfig.tenant,
    };
  };

  out = () => {
    let formData = {};
    formData['metadata'] = {
      name: this.formData['user'],
      tenant: this.formData['tenant'],
    };
    formData['spec'] = {
      account_type: 4,
    };

    this.formData = formData;
  };

  onFinish = () => {
    // TODO: 增加数据时，后端需校验更新者是否有更新的权限
    const object = new Account(this.formData);
    accountStore
      .create({namespace: object.getNs(), name: object.getName()}, object)
      .then(() => {
        Notifications.ok(`${this.formData['user']} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };

  onMount = form => {
    var tenant: string[] = [];
    var disableEditTenant = false;
    if (this.userconfig.roleType === 3) {
      tenantStore.items.map(object => {
        tenant.push(object.getName());
      });
    } else {
      tenant = [this.userconfig.tenant];
      disableEditTenant = true;
    }

    var user: string[] = [];
    var userName: string[] = [];

    userStore.api.query().then(res => {
      res.map(object => {
        user.push(object.getName());
        userName.push(object.spec.cn_name);
      });
      form.setSchemaByPath('user', {
        enum: user,
        enumNames: userName,
      });
    });

    form.setSchemaByPath('tenant', {
      enum: tenant,
      enumNames: tenant,
      disabled: disableEditTenant,
    });

    const accountIds = Array.from(
      UserConfig.getUserType(this.userconfig.roleType).keys()
    );
    const accountNames = Array.from(
      UserConfig.getUserType(this.userconfig.roleType).values()
    );

    form.setSchemaByPath('accounttype', {
      enum: accountIds,
      enumNames: accountNames,
    });
  };
}
