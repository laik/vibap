import Link from '@mui/material/Link';
import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {delay, FormRenderDialog} from '../../template/form';
import Notifications from '../../template/notification';
import {Menu, menuStore, menuTypeCode, menuTypeName} from './menu.store';

const schema = {
  type: 'object',
  labelWidth: 120,
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
      minRows: '2',
      size: 'small',

      label: '标签',
      color: 'primary',
    },
    link: {
      title: '链接',
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
    icon: {
      title: '图标名',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      default: '',
      disabled: false,
      maxRows: '5',
      minRows: '2',
      helperText: (
        <Link href='https://fonts.google.com/icons' underline='none'>
          fonts.google.com/icons
        </Link>
      ),
      size: 'small',

      label: '标签',
      color: 'primary',
    },
    title: {
      title: '标题',
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
    type: {
      title: '类型',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

      size: 'small',
      default: '',
      required: true,
    },
    level: {
      title: '菜单等级',
      type: 'number',
      widget: 'select',
      enum: [2, 3],
      enumNames: [2, 3],

      size: 'small',
      default: '',
      required: true,
      'ui:hidden': '{{formData.type == "product" || formData.type == ""}}',
    },
    parent: {
      title: '父菜单',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],

      size: 'small',
      'ui:hidden': '{{formData.type == "product" || formData.type == ""}}',
      default: '',
      required: true,
    },
    is_sub_menu: {
      title: '是否显示业务菜单',
      type: 'boolean',
      widget: 'switchWidget',
      required: true,
      size: 'medium',
      default: true,
      'ui:hidden': '{{formData.type == "product" || formData.type == ""}}',
    },
  },
};

@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  subTitle = '添加菜单';
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
    let formData = {};
    formData['metadata'] = {
      name: this.formData['name'],
    };
    formData['spec'] = {
      link: this.formData['link'],
      title: this.formData['title'],
      icon: this.formData['icon'],
      type: this.formData['type'],
      level: this.formData['type'] == 'product' ? 1 : this.formData['level'],
      is_sub_menu:
        this.formData['type'] == 'product'
          ? false
          : this.formData['is_sub_menu'],
      parent: this.formData['parent'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    const object = new Menu(this.formData);
    menuStore
      .create({name: object.metadata.name}, object)
      .then(() => {
        Notifications.ok(`${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };

  watch = form => {
    return {
      level: val => {
        let parent_menus = [];
        let parent_menus_names = [];
        menuStore.items
          .filter(item => item.spec.level == val - 1)
          .forEach(object => {
            parent_menus.push(object.getName());
            parent_menus_names.push(
              `${object.getName()} (${object.spec.level})`
            );
          });

        delay(0).then(_ => {
          form.setSchemaByPath('parent', {
            enum: parent_menus,
            enumNames: parent_menus_names,
          });
        });
      },
    };
  };

  onMount = form => {
    let parent_menus = [];
    let parent_menus_names = [];
    menuStore.items.forEach(object => {
      parent_menus.push(object.getName());
      parent_menus_names.push(`${object.getName()} (${object.spec.level})`);
    });
    delay(0).then(_ => {
      form.setSchemaByPath('parent', {
        enum: parent_menus,
        enumNames: parent_menus_names,
      });

      form.setSchemaByPath('type', {
        enum: menuTypeCode,
        enumNames: menuTypeName,
      });
    });
  };
}
