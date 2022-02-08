import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {CustomResource, customResourceStore} from './store';

const schema = {
  type: 'object',
  labelWidth: 90,
  displayType: 'row',
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
  },
};

@observer
export class Add extends FormRenderDialog {
  @observable static ok: boolean = false;

  subTitle = '新增自定义数据结构';
  schema = schema;

  static open() {
    Add.ok = true;
  }

  close() {
    Add.ok = false;
  }

  @computed get isOpen() {
    return Add.ok;
  }

  out = () => {
    this.formData['metadata'] = {
      name: this.formData['name'],
    };
  };

  onFinish = () => {
    const object = new CustomResource(this.formData);
    customResourceStore
      .create({namespace: '', name: object.metadata.name}, object)
      .then(() => {
        Notifications.ok(
          `customResource ${object.metadata.name} save succeeded`
        );
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
