import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {FormRenderDialog} from '../../template/form';
import Notifications from '../../template/notification';
import {Operation, operationStore} from './store';

const schema = {
  type: 'object',
  labelWidth: 90,
  displayType: 'row',
  properties: {
    name: {
      title: '名称',
      type: 'string',
      widget: 'input',
      label: 'name',
      html5type: 'text',
      required: true,
      default: '',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      size: 'small',

      color: 'primary',
    },
    op: {
      title: '操作码',
      type: 'string',
      widget: 'input',
      label: 'op',
      html5type: 'text',
      required: true,
      default: '',
      disabled: false,
      maxRows: '5',
      minRows: '1',
      size: 'small',

      color: 'primary',
    },
    method: {
      title: '方法',
      type: 'string',
      widget: 'select',
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      enumNames: ['GET', 'POST', 'PUT', 'DELETE'],

      size: 'small',
      default: '',
      required: true,
    },
  },
};

@observer
export class AddOperationDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  schema = schema;
  subTitle = '新增操作';

  static open() {
    AddOperationDialog.ok = true;
  }

  close() {
    AddOperationDialog.ok = false;
  }

  @computed get isOpen() {
    return AddOperationDialog.ok;
  }

  static handleFormData(changedValues: Object, formData) {
    const keyNameArray = Object.keys(changedValues)[0];
    const value = Object.values(changedValues)[0];
    formData[keyNameArray] = value;
  }

  onFinish = () => {
    const operation: Partial<Operation> = {
      metadata: {
        name: this.formData['name'],
      },
      spec: {
        op: this.formData['op'],
        method: this.formData['method'],
      },
    };

    operationStore
      .create({name: this.formData['name']}, operation)
      .then(() => {
        Notifications.ok(`operation ${this.formData['name']} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
