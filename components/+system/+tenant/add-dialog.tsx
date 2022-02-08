import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { FormRenderDialog } from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import { Tenant, tenantStore, tenantThridTools } from './store';

const schema = {
  type: 'object',
  labelWidth: 120,
  displayType: 'row',
  properties: {
    name: {
      title: '名称',
      type: 'string',
      widget: 'input',
      disabled: false,
      html5type: 'text',
      size: 'small',

      default: '',
      maxRows: '5',
      minRows: '2',
      startAdornment: '',
      endAdornment: '',
      color: 'primary',
      required: true,
    },
    thridtype: {
      title: '租户用户工具',
      type: 'string',
      widget: 'select',
      enum: ['feishu', 'dingding', 'weixin'],
      enumNames: ['飞书', '钉钉', '微信'],
      disabled: false,
      size: 'small',
      default: '',

      color: 'info',
      fullWidth: true,
      required: true,
    },
    key: {
      title: '标识码(租户唯一)',
      type: 'string',
      widget: 'input',
      disabled: false,
      html5type: 'text',
      size: 'small',

      default: '',
      maxRows: '5',
      minRows: '2',
      startAdornment: '',
      endAdornment: '',
      color: 'primary',
      required: true,
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;

  subTitle = '创建租户';
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

  onMount = form => {
    form.setSchemaByPath('thridtype', {
      enum: Object.keys(tenantThridTools),
      enumNames: Object.values(tenantThridTools),
    });
  };

  out = () => {
    let formData = {};
    formData['metadata'] = {
      name: this.formData['name'],
    };
    formData['spec'] = {
      owner: '',
      type: this.formData['thridtype'],
      key: this.formData['key'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    const object: Partial<Tenant> = this.formData;
    tenantStore
      .create({name: object.metadata.name}, object)
      .then(() => {
        Notifications.ok(`${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
