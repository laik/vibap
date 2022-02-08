import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { tenantStore } from '../+tenant/store';
import { apiManager } from '../../../client';
import { FormRenderDialog } from '../../template/form';
import { delay } from '../../template/form/fr';
import Notifications from '../../template/notification';
import { Workspace, workspaceStore } from './store';

const schema = {
  type: 'object',
  labelWidth: 120,
  displayType: 'row',
  properties: {
    name: {
      title: '名字',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      required: true,
      size: 'small',

      color: 'primary',
      default: '',
      startAdornment: '',
      endAdornment: '',
    },
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
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;

  subTitle = '新增工作空间';
  schema = schema;

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
      workspace: this.formData['tenant']
    };
    formData['spec'] = {
      tenant: this.formData['tenant'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    const object = new Workspace(this.formData);
    workspaceStore
      .create({ name: object.getName() }, object)
      .then(() => {
        Notifications.ok(`${object.getName()} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };

  onMount = form => {
    const userConfig = apiManager.userConfig
    if (userConfig.roleType !== 3) {
      Notifications.error('您不是租户管理员，无法管理工作');
      return;
    }
    tenantStore.
      api.
      query({}, {})
      .then(tenants => {
        const tenantNames = tenants.map(tenant => tenant.metadata.name);
        delay(0).then(_ => {
          form.setSchemaByPath('tenant', {
            enum: tenantNames,
            enumNames: tenantNames,
          });
        });
      })
  };
}
