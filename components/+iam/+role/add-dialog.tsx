import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {businessGroupStore} from '../+business-group/store';
import {tenantStore} from '../../+system/+tenant/store';
import {redux_userconfig} from '../../../client/redux-store';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {Role, roleStore} from './store';

const schema = {
  type: 'object',
  labelWidth: 120,
  displayType: 'row',
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
    business: {
      title: '业务组',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],
      required: true,
      disabled: false,
      size: 'small',
      default: '',

      color: 'info',
      fullWidth: true,
    },
    name: {
      title: '名称',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      size: 'small',

      label: '标签',
      disabled: false,
      default: '',
      required: true,
      maxRows: '5',
      minRows: '2',
      startAdornment: '',
      endAdornment: '',
      color: 'primary',
    },
    remark: {
      title: '备注',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      size: 'small',

      label: '标签',
      disabled: false,
      default: '',
      maxRows: '5',
      minRows: '2',
      startAdornment: '',
      endAdornment: '',
      color: 'primary',
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;

  subTitle = '添加角色';
  schema = schema;
  userConfig = redux_userconfig();
  inTrigger = true;

  static open() {
    AddDialog.ok = true;
  }

  close() {
    AddDialog.ok = false;
  }

  @computed get isOpen() {
    return AddDialog.ok;
  }

  out = () => {
    let formData = {};
    formData['metadata'] = {
      name: this.formData['name'],
      workspace: this.formData['business'],
      tenant: this.formData['tenant'],
    };
    formData['spec'] = {
      business: this.formData['business'],
      remark: this.formData['remark'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    const object = new Role(this.formData);
    roleStore
      .create({name: object.metadata.name}, object)
      .then(() => {
        Notifications.ok(`${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };

  in = () => {
    this.formData = {
      tenant: this.userConfig.tenant,
    };
  };

  onMount = form => {
    var tenants: string[] = [];
    const isadmin = this.userConfig.roleType === 3;

    if (isadmin) {
      tenantStore.api.query({}).then(objects => {
        objects.forEach(object => {
          tenants.push(object.getName());
        });
        form.setSchemaByPath('tenant', {
          enum: tenants,
          enumNames: tenants,
        });
      });
    } else {
      form.setSchemaByPath('tenant', {
        enum: [this.userConfig.tenant],
        enumNames: [this.userConfig.tenant],
        default: this.userConfig.tenant,
        disabled: !isadmin,
      });
    }
    if (isadmin) {
      //TODO: admin view all business
    } else {
      businessGroupStore.api
        .query({}, {tenant: this.userConfig.tenant})
        .then(objects => {
          const business = objects.map(object => object.getName());
          form.setSchemaByPath('business', {
            enum: business,
            enumNames: business,
          });
        });
    }
  };
}
