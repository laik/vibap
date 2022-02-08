import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {Provider, providerStore} from '../+provider/store';
import {Workspace, workspaceStore} from '../+workspace/store';
import {delay} from '../../template/form';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {License, licenseStore} from './license.store';

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
      size: 'small',

      label: '标签',
      color: 'primary',
    },
    workspace: {
      title: '工作空间',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

      size: 'small',
      label: '标签',
      required: true,
    },
    provider: {
      title: '供应商',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

      size: 'small',
      label: '标签',
      required: true,
    },
    region: {
      title: '地区',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      size: 'small',

      label: '标签',
      color: 'primary',
    },
    available_zone: {
      title: '可用区',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      size: 'small',

      label: '标签',
      color: 'primary',
    },
    sshtype: {
      title: 'ssh类型',
      type: 'string',
      widget: 'radio',
      enum: ['rsa', 'password'],
      enumNames: ['rsa', 'password'],
      size: 'small',
    },
    password: {
      title: '密码',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      size: 'small',

      label: '标签',
      color: 'primary',
      'ui:hidden': "{{formData.sshtype != 'password'}}",
    },
    rsa: {
      title: '密钥',
      type: 'string',
      widget: 'aceEditor',
      mode: 'python',
      theme: 'tomorrow',
      aceHeight: '400px',
      aceWidth: '700px',
      fontSize: 14,
      tabSize: 2,
      'ui:hidden': "{{formData.sshtype != 'rsa'}}",
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;

  maxWidth = 'md';
  subTitle = '添加证书';
  schema = schema;

  onMount = form => {
    var workspaceList: string[] = [];
    var providerIdList: string[] = [];
    var providerNameList: string[] = [];

    workspaceStore.items.map((object: Workspace) => {
      workspaceList.push(object.getName());
    });

    providerStore.items.map((object: Provider) => {
      providerIdList.push(object.getName());
      providerNameList.push(object.spec.localName);
    });

    delay(0).then(_ => {
      form.setSchemaByPath('workspaces', {
        enum: workspaceList,
        enumNames: workspaceList,
      });

      form.setSchemaByPath('provider', {
        enum: providerIdList,
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
    let key: string = this.formData['password'];

    if (this.formData['sshtype'] == 'rsa') {
      key = this.formData['rsa'];
    }

    this.formData['metadata'] = {
      name: this.formData['name'],
      workspace: this.formData['workspace'],
      namespace: this.formData['provider'],
    };
    this.formData['spec'] = {
      vendor: this.formData['provider'],
      region: this.formData['region'],
      available_zone: this.formData['available_zone'],
      ssh_type: this.formData['sshtype'],
      key: key,
    };
  };

  onFinish = () => {
    const object = new License(this.formData);
    licenseStore
      .create(
        {namespace: object.getWorkspace(), name: object.metadata.name},
        object
      )
      .then(() => {
        Notifications.ok(`license ${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
