import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {Theme, themeStore} from './store';

const schema = {
  type: 'object',
  properties: {
    name: {
      title: '名称',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      default: '',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      size: 'small',

      label: '标签',
      color: 'primary',
    },
    mui: {
      title: 'mui配置',
      type: 'string',
      widget: 'aceEditor',
      mode: 'json',
      theme: 'tomorrow',
      aceHeight: '400px',
      aceWidth: '700px',
      fontSize: 14,
      tabSize: 2,
      default: '',
    },
    data_grid: {
      title: '表格主题',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      default: '',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      size: 'small',

      label: '标签',
      color: 'primary',
    },
  },
  labelWidth: 120,
  displayType: 'row',
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  maxWidth = 'md';
  subTitle = '创建主题';
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
    };
    formData['spec'] = {
      mui: this.formData['mui'],
      data_grid: this.formData['data_grid'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    const object: Partial<Theme> = this.formData;
    themeStore
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
