import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {Provider, providerStore} from '../+provider/store';
import {regionStore} from '../+region/store';
import {zoneStore} from '../+zone/store';
import {delay} from '../../template/form';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {Cluster, clusterStore} from './store';

const schema = {
  type: 'object',
  labelWidth: 80,
  displayType: 'row',
  properties: {
    name: {
      title: '集群名',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      required: true,
      disabled: false,
      maxRows: '1',
      minRows: '1',
      size: 'small',
      label: '标签',
      color: 'primary',
      default: '',
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
      title: '区域',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

      size: 'small',
      default: '',
      required: true,
    },
    az: {
      title: '可用区',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],
      size: 'small',
      default: '',
      required: true,
    },
    format: {
      title: '格式',
      type: 'string',
      default: 'JSON',
      widget: 'radio',
      enum: ['JSON', 'YAML'],
      enumNames: ['JSON', 'YAML'],
      size: 'small',
    },
    yaml: {
      title: 'YAML',
      type: 'string',
      widget: 'aceEditor',
      mode: 'yaml',
      theme: 'tomorrow',
      aceHeight: '400px',
      aceWidth: '700px',
      fontSize: 14,
      tabSize: 2,
      required: true,
      'ui:hidden': "{{formData.format === 'JSON'}}",
    },
    json: {
      title: 'JSON',
      type: 'string',
      widget: 'aceEditor',
      mode: 'json',
      theme: 'tomorrow',
      aceHeight: '400px',
      aceWidth: '700px',
      fontSize: 14,
      tabSize: 2,
      required: true,
      'ui:hidden': "{{formData.format === 'YAML'}}",
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;

  maxWidth = 'md';
  subTitle = '添加集群';
  schema = schema;

  watch = form => {
    return {
      '#': val => {
        const {provider, region} = val;
        if (provider !== '' && region !== '') {
          var zoneIdList: string[] = [];
          var zoneNameList: string[] = [];

          zoneStore.items
            .filter(
              object =>
                object.getNamespace() === provider &&
                object.spec.region === region
            )
            .map(object => {
              zoneIdList.push(object.spec.id);
              zoneNameList.push(object.getName());
            });

          delay(200).then(_ => {
            form.setSchemaByPath('az', {
              enum: zoneIdList,
              enumNames: zoneNameList,
            });
          });
        }
      },

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

  onMount = form => {
    var providerIDList: string[] = [];
    var providerNameList: string[] = [];

    providerStore.items.map((object: Provider) => {
      providerIDList.push(object.getName());
      providerNameList.push(object.spec.localName);
    });

    delay(200).then(_ => {
      form.setSchemaByPath('provider', {
        enum: providerIDList,
        enumNames: providerNameList,
      });
    });
  };

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
      workspace: this.formData['workspace'],
      namespace: this.formData['provider'],
    };
    this.formData['spec'] = {
      provider: this.formData['provider'],
      region: this.formData['region'],
      az: this.formData['az'],
      config: this.formData['config'],
    };
  };

  onFinish = () => {
    const object = new Cluster(this.formData);
    clusterStore
      .create({name: object.metadata.name}, object)
      .then(() => {
        Notifications.ok(`cluster ${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
