import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {Provider, providerStore} from './store';

const schema = {
  type: 'object',
  labelWidth: 120,
  displayType: 'row',
  properties: {
    name: {
      title: '名称代号',
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
      required: true,
    },
    localName: {
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
      required: true,
    },
    thirdParty: {
      title: '第三方',
      type: 'boolean',
      widget: 'switchWidget',
      required: true,
      size: 'medium',
      default: false,
    },
    accessKey: {
      title: 'AccessKey',
      type: 'string',
      widget: 'input',
      html5type: 'password',
      default: '',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      size: 'small',

      label: '标签',
      color: 'primary',
      required: true,
      'ui:hidden': '{{formData.thirdParty == false}}',
    },
    accessSecret: {
      title: 'AccessSecret',
      type: 'string',
      widget: 'input',
      html5type: 'password',
      required: true,
      default: '',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      size: 'small',

      label: '标签',
      color: 'primary',
      'ui:hidden': '{{formData.thirdParty == false}}',
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  subTitle = '增加供应商';
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
    this.formData['metadata'] = {
      name: this.formData['name'],
      namespace: this.formData['name'],
    };
    this.formData['spec'] = {
      localName: this.formData['localName'],
      thirdParty: this.formData['thirdParty'],
      accessKey: this.formData['accessKey'],
      accessSecret: this.formData['accessSecret'],
    };
  };

  onFinish = () => {
    const object = new Provider(this.formData);
    console.log(object);

    providerStore
      .create(
        {namespace: object.getWorkspace(), name: object.metadata.name},
        object
      )
      .then(() => {
        Notifications.ok(`provider ${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
