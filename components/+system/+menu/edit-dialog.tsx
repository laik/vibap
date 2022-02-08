import Link from '@mui/material/Link';
import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { delay } from '../../template/form/fr';
import { FormRenderDialog } from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import { Menu, menuStore, menuTypeCode, menuTypeName } from './menu.store';

const schema = {
  type: 'object',
  labelWidth: 150,
  displayType: 'row',
  properties: {
    link: {
      title: '链接',
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
    icon: {
      title: '图标名',
      type: 'string',
      widget: 'input',
      html5type: 'text',
      default: '',
      disabled: false,
      maxRows: '5',
      minRows: '1',
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
      maxRows: '5',
      required: true,
      minRows: '1',
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
export class EditDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  @observable static data: Menu;

  schema = schema;
  subTitle = '编辑菜单';

  static open(data: Menu) {
    EditDialog.data = data;
    EditDialog.ok = true;
  }

  close() {
    EditDialog.ok = false;
  }

  @computed get isOpen() {
    return EditDialog.ok;
  }

  @computed get object() {
    return EditDialog.data;
  }

  in = () => {
    this.formData = {
      link: this.object.spec.link,
      title: this.object.spec.title,
      icon: this.object.spec.icon,
      type: this.object.spec.type,
      level: this.object.spec.type == 'product' ? 1 : this.object.spec.level,
      is_sub_menu: this.object.spec.is_sub_menu,
      parent: this.object.spec.parent,
    };
  };

  out = () => {
    let formData = {};
    formData['metadata'] = {
      name: this.object.getName(),
    };

    formData['spec'] = {
      link: this.formData['link'],
      title: this.formData['title'],
      icon: this.formData['icon'],
      type: this.formData['type'],
      level: this.formData['type'] == 'product' ? 1 : this.formData['level'],
      is_sub_menu: this.formData['is_sub_menu'],
      parent: this.formData['parent'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    console.log('onFinish', this.formData);
    const object: Partial<Menu> = this.formData;
    menuStore
      .update(this.object, object, {path: 'spec'})
      .then(() => {
        Notifications.ok(`${this.object.getName()} save succeeded`);
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
    menuStore.items
      .filter(item => item.spec.level == this.object.spec.level - 1)
      .forEach(object => {
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
