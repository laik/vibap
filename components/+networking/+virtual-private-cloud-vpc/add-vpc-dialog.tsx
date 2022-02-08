import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Provider, providerStore } from '../../+system/+provider/store';
import { Region, regionStore } from '../../+system/+region/store';
import { redux_userconfig } from '../../../client/redux-store';
import { FormRenderDialog } from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import { Vpc, vpcStore } from './vpc.store';

const schema = {
  type: 'object',
  properties: {
    local_name: {
      title: '备注名称',
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
    },
    provider: {
      title: '云供应商',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

      size: 'small',
      default: '',
      required: true,
    },
    workspace: {
      title: '工作空间(业务组)',
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
    ip: {
      title: 'ip',
      type: 'string',
      widget: 'ipv4',
      default: '192.168.1.1',
      cidr: true,
    },
  },
  labelWidth: 120,
  displayType: 'row',
};

@observer
export class AddNetworkDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  @observable static providerList: string[] = observable.array([], {
    deep: false,
  });
  @observable static providerNameList: string[] = observable.array([], {
    deep: false,
  });

  subTitle = '创建vpc';
  schema = schema;

  userConfig = redux_userconfig();

  onMount = form => {
    providerStore.api.query().then((value: Provider[]) => {
      value.map(item => {
        AddNetworkDialog.providerList.push(item.getName());
        AddNetworkDialog.providerNameList.push(item.spec.localName);
      });

      form.setSchemaByPath('provider', {
        description: '',
        enum: AddNetworkDialog.providerList,
        enumNames: AddNetworkDialog.providerNameList,
      });
    });

    form.setSchemaByPath('workspace', {
      enum: this.userConfig.allowWorkspaces,
      enumNames: this.userConfig.allowWorkspaces,
    });
  };

  watch = form => {
    return {
      provider: val => {
        var regionIDList: string[] = [];
        var regionNameList: string[] = [];
        regionStore.api.query({}).then((value: Region[]) => {
          value.map(item => {
            if (item.getNamespace() != val) {
              return;
            }
            regionIDList.push(item.spec.id);
            regionNameList.push(item.spec.local_name);
          });

          form.setSchemaByPath('region', {
            enum: regionIDList,
            enumNames: regionNameList,
          });
        });
      },
    };
  };

  static open() {
    AddNetworkDialog.ok = true;
  }

  close() {
    AddNetworkDialog.ok = false;
    AddNetworkDialog.providerList = [];
  }

  @computed get isOpen() {
    return AddNetworkDialog.ok;
  }

  out = () => {
    const vpcName: string = this.formData['local_name'];
    var cidr: string = this.formData['ip'].split('/');

    if (vpcName == '' || vpcName.indexOf('_') != -1) {
      Notifications.error(`vpc object format error`);
      return;
    }
    this.formData['metadata'] = {
      name: vpcName,
      workspace: this.formData['workspace'],
      namespace: this.formData['provider'],
    };
    this.formData['spec'] = {
      local_name: vpcName,
      ip: cidr[0],
      mask: cidr[1],
      region: this.formData['region'],
    };
  };

  onFinish = () => {
    const object = new Vpc(this.formData);

    vpcStore
      .create(
        {namespace: object.getNamespace(), name: object.metadata.name},
        object
      )
      .then(() => {
        Notifications.ok(`vpc ${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
