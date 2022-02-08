import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {userStore} from '../+user/store';
import {tenantStore} from '../../+system/+tenant/store';
import {redux_userconfig} from '../../../client/redux-store';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {BusinessGroup, businessGroupStore} from './store';

const schema = {
  type: 'object',
  labelWidth: 120,
  displayType: 'row',
  properties: {
    tenant: {
      title: '租户',
      type: 'any',
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
    name: {
      title: '名称',
      type: 'string',
      widget: 'input',
      label: 'Name',
      required: true,
      disabled: false,
      html5type: 'text',
      size: 'small',
      default: '',
      maxRows: '5',
      minRows: '2',
      startAdornment: '',
      endAdornment: '',
      color: 'primary',
      // "rules": [
      //   {
      //     // "pattern": "^_",
      //     // "message": "不允许有下划线"
      //   }
      // ]
    },
    owner: {
      title: '属主帐户',
      type: 'any',
      widget: 'select',
      enum: [],
      enumNames: [],
      disabled: false,
      size: 'small',
      color: 'info',
      fullWidth: true,
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  inTrigger = true;
  schema = schema;
  userconfig = redux_userconfig();
  userMap = new Map<string, string>();

  subTitle = '添加业务组';

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
      name: this.formData['name'],
      tenant: this.formData['tenant'],
    };
    const ownerName = this.userMap.get(this.formData['owner']);
    formData['spec'] = {
      owner: this.formData['owner'],
      ownerName: ownerName,
    };

    this.formData = formData;
  };

  onFinish = () => {
    const object = new BusinessGroup(this.formData);
    businessGroupStore
      .create({namespace: object.getNs(), name: object.getName()}, object)
      .then(() => {
        Notifications.ok(`${object.getName()} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };

  onMount = form => {
    var tenants: string[] = [];
    var users: string[] = [];
    var userNames: string[] = [];
    const isAdmin = this.userconfig.roleType === 3;

    if (isAdmin) {
      tenantStore.api.query().then(objects => {
        objects.forEach(object => {
          tenants.push(object.getName());
        });
        userStore.api.query({}).then(objects => {
          objects.forEach(object => {
            users.push(object.getName());
            userNames.push(object.spec.cn_name);
            this.userMap.set(object.getName(), object.spec.cn_name);
          });
          form.setSchemaByPath('tenant', {
            enum: tenants,
            enumNames: tenants,
          });
          form.setSchemaByPath('owner', {
            enum: users,
            enumNames: userNames,
          });
        });
      });
    } else {
      form.setSchemaByPath('tenant', {
        enum: [this.userconfig.tenant],
        enumNames: [this.userconfig.tenant],
        disabled: true,
      });

      userStore.api.query({}).then(objects => {
        objects
          .filter(object => object.getName() != this.userconfig.userName) // 去掉自己
          .forEach(object => {
            users.push(object.getName());
            userNames.push(object.spec.cn_name);
            this.userMap.set(object.getName(), object.spec.cn_name);
          });
        form.setSchemaByPath('owner', {
          enum: users,
          enumNames: userNames,
        });
      });
    }
  };
}
