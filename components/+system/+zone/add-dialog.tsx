import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {regionStore} from '../+region/store';
import {apiManager} from '../../../client';
import {delay} from '../../template/form';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {Zone, zoneStore} from './store';

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
    localName: {
      title: '本地名称',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      default: '',
      disabled: false,
      maxRows: '5',
      minRows: '2',
      size: 'small',

      label: '标签',
      color: 'primary',
      required: true,
    },
    provider: {
      title: '供应商',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

      size: 'small',
      default: '',
      required: true,
    },
    region: {
      title: '地区',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

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
  subTitle = '增加可用区';
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

  watch = form => {
    return {
      provider: val => {
        if (!val) {
          return;
        }
        var regionIDList: string[] = [];
        var regionNameList: string[] = [];

        regionStore.items
          .filter(object => object.getNamespace() === val)
          .map(object => {
            regionIDList.push(object.spec.id);
            regionNameList.push(object.spec.local_name);
          });

        delay(200).then(_ => {
          form.setSchemaByPath('region', {
            enum: regionIDList,
            enumNames: regionNameList,
          });
        });
      },
    };
  };

  out = () => {
    this.formData['metadata'] = {
      name:
        this.formData['provider'] +
        '-' +
        this.formData['region'] +
        '-' +
        this.formData['code'],
      namespace: this.formData['provider'],
    };
    this.formData['spec'] = {
      region: this.formData['region'],
      local_name: this.formData['localName'],
      id: this.formData['code'],
    };
  };

  onFinish = () => {
    const object = new Zone(this.formData);
    zoneStore
      .create(
        {namespace: object.getWorkspace(), name: object.metadata.name},
        object
      )
      .then(() => {
        Notifications.ok(`zone ${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
