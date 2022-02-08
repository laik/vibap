import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {CustomResource, customResourceStore} from './store';

const schema = {
  type: 'object',
  properties: {
    custom: {
      title: '结构',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: {
            title: '键值',
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
          keytype: {
            title: '类型',
            type: 'string',
            widget: 'select',
            enum: ['string', 'int', 'bool'],
            enumNames: ['string', 'int', 'bool'],

            size: 'small',
            default: '',
            required: true,
          },
        },
      },
      props: {},
    },
  },
  labelWidth: 70,
  displayType: 'row',
};

const customType: string[] = ['string', 'number', 'boolean'];

@observer
export class Edit extends FormRenderDialog {
  @observable static ok: boolean = false;
  @observable static data: CustomResource = null;
  maxWidth = 'md';

  subTitle = '配置规则';
  schema = schema;

  onMount = form => {
    form.setSchemaByPath('custom[].keytype', {
      enum: customType,
      enumNames: customType,
    });
  };

  static open(object: CustomResource) {
    Edit.data = object;
    Edit.ok = true;
  }

  close() {
    Edit.ok = false;
    Edit.data = null;
  }

  @computed get isOpen() {
    return Edit.ok;
  }

  @computed get object() {
    return Edit.data;
  }

  in = () => {
    let customList = [];
    const cr = Edit.data.spec?.custom_resource;
    cr &&
      Object.entries(cr).forEach((value, key) => {
        let map = {};
        map['key'] = value[0];
        map['keytype'] = value[1];
        customList.push(map);
      });

    this.formData['custom'] = customList;
  };

  out = () => {
    let map = {};
    this.formData['custom'].map(item => {
      map[item.key] = item.keytype;
    });

    Edit.data.spec.custom_resource = map;
  };

  onFinish = () => {
    const cr: Partial<CustomResource> = Edit.data;
    customResourceStore
      .update(this.object, cr)
      .then(() => {
        Notifications.ok(
          `customResource ${this.formData['name']} save succeeded`
        );
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
