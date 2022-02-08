import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Vpc, vpcStore } from '../+virtual-private-cloud-vpc/vpc.store';
import { Provider, providerStore } from '../../+system/+provider/store';
import { Region, regionStore } from '../../+system/+region/store';
import { Zone, zoneStore } from '../../+system/+zone/store';
import { redux_userconfig } from '../../../client/redux-store';
import { FormRenderDialog } from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import { VSwitch, vswitchStore } from './vswitch.store';

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
    zone: {
      title: '可用区',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

      size: 'small',
      default: '',
      required: true,
    },
    vpc: {
      title: 'vpc',
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
export class AddVSwitchDialog extends FormRenderDialog {
  @observable static ok: boolean = false;

  subTitle = '创建子网';
  schema = schema;

  userConfig = redux_userconfig();

  static open() {
    AddVSwitchDialog.ok = true;
  }

  close() {
    AddVSwitchDialog.ok = false;
  }

  @computed get isOpen() {
    return AddVSwitchDialog.ok;
  }

  onMount = form => {
    let providerList = [];
    let providerNameList = [];
    providerStore.api.query().then((value: Provider[]) => {
      value.map(item => {
        providerList.push(item.getName());
        providerNameList.push(item.spec.localName);
      });

      form.setSchemaByPath('provider', {
        enum: providerList,
        enumNames: providerNameList,
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
        regionStore.api.query().then((value: Region[]) => {
          value.map(item => {
            if (item.getNamespace() != val) {
              return;
            }
            regionIDList.push(item.spec.id);
            regionNameList.push(item.spec.local_name);
          });
          form.setSchemaByPath('region', {
            description: '',
            enum: regionIDList,
            enumNames: regionNameList,
          });
        });
      },

      region: val => {
        var zoneIdList: string[] = [];
        var zoneNameList: string[] = [];

        var vpcIdList: string[] = [];
        var vpcNameList: string[] = [];

        zoneStore.api.query({}).then((value: Zone[]) => {
          value.map(item => {
            if (
              item.getNamespace() != this.onChangeformData['provider'] ||
              item.spec.region != val
            ) {
              return;
            }
            zoneIdList.push(item.spec.id);
            zoneNameList.push(item.spec.local_name);
          });
          form.setSchemaByPath('zone', {
            enum: zoneIdList,
            enumNames: zoneNameList,
          });
        });

        vpcStore.api.query({}).then((value: Vpc[]) => {
          value.map(item => {
            if (
              item.getNamespace() != this.onChangeformData['provider'] ||
              item.spec.region != val
            ) {
              return;
            }
            vpcIdList.push(item.spec.id);
            vpcNameList.push(
              `${item.spec.local_name}-${item.getName()} (${item.spec.ip}/${
                item.spec.mask
              })`
            );
          });

          form.setSchemaByPath('vpc', {
            description: '',
            enum: vpcIdList,
            enumNames: vpcNameList,
          });
        });
      },
    };
  };

  out = () => {
    const vSwitchName: string = this.formData['local_name'];
    var cidr: string = this.formData['ip'].split('/');

    if (vSwitchName == '' || vSwitchName.indexOf('_') != -1) {
      Notifications.error(`vswitch object format error`);
      return;
    }

    this.formData['metadata'] = {
      name: vSwitchName,
      workspace: this.formData['workspace'],
      namespace: this.formData['provider'],
    };
    this.formData['spec'] = {
      local_name: vSwitchName,
      region: this.formData['region'],
      ip: cidr[0],
      mask: cidr[1],
      vpc_id: this.formData['vpc'],
      zone: this.formData['zone'],
    };
  };

  onFinish = () => {
    const object = new VSwitch(this.formData);
    vswitchStore
      .create(
        {namespace: object.getNamespace(), name: object.metadata.name},
        object
      )
      .then(() => {
        Notifications.ok(`vswitch ${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
