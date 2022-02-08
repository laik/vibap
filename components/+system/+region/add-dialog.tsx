import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {Region, regionStore} from '../+region/store';
import {apiManager} from '../../../client';
import {delay} from '../../template/form';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';

const schema = {
  type: 'object',
  labelWidth: 120,
  displayType: 'row',
  properties: {
    code: {
      title: '代码',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      required: true,
      disabled: false,
      maxRows: '1',
      minRows: '1',
      size: 'small',
      variant: 'filled',
      label: '标签',
      color: 'primary',
      default: '',
    },
    local_name: {
      title: '本地名称',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      default: '',
      disabled: false,
      required: true,
      maxRows: '5',
      minRows: '2',
      size: 'small',

      label: '标签',
      color: 'primary',
    },
    provider: {
      title: '供应商',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],
      helperText: '只允许选择私有云供应商',

      size: 'small',
      default: '',
      required: true,
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;

  maxWidth = 'md';
  subTitle = '增加区域';
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
    var providerIdList: string[] = [];
    var providerNameList: string[] = [];

    apiManager.userConfig.providers &&
      Object.entries(apiManager.userConfig.providers)
        .filter(([_, provider]) => !provider.thirdParty)
        .forEach(([_, provider]) => {
          providerIdList.push(provider.name);
          providerNameList.push(provider.localName);
        });

    delay(0).then(_ => {
      form.setSchemaByPath('provider', {
        enum: providerIdList,
        enumNames: providerNameList,
      });
    });
  };

  out = () => {
    this.formData['metadata'] = {
      name: this.formData['provider'] + '-' + this.formData['code'],
      namespace: this.formData['provider'],
    };
    this.formData['spec'] = {
      local_name: this.formData['local_name'],
      id: this.formData['code'],
    };
  };

  onFinish = () => {
    const object = new Region(this.formData);
    regionStore
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
