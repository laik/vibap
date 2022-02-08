import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { menuStore } from '../+menu/menu.store';
import { operationStore } from '../+operation/store';
import { FormRenderDialog } from '../../template/form';
import Notifications from '../../template/notification';
import { Resource, resourceStore } from './store';

const schema = {
  "type": "object",
  "labelWidth": 120,
  "displayType": "row",
  "properties": {
    "apiversion": {
      "title": "Api版本",
      "type": "string",
      "widget": "input",
      "html5type": "text",
      "default": "",
      "disabled": false,
      "maxRows": "5",
      "minRows": "1",
      "size": "small",
      "label": "标签",
      "color": "primary"
    },
    "menu": {
      "title": "菜单",
      "type": "string",
      "widget": "select",
      "size": "small",
      "enum": [],
      "enumNames": [],
      "required": true
    },
    "group": {
      "title": "组",
      "type": "string",
      "widget": "input",
      "html5type": "text",
      "default": "",
      "disabled": false,
      "maxRows": "5",
      "minRows": "1",
      "size": "small",
      "label": "标签",
      "color": "primary"
    },
    "type": {
      "title": "访问类型",
      "type": "string",
      "widget": "select",
      "required": true,
      "enum": [
        1,
        2
      ],
      "enumNames": [
        "私有资源",
        "公共资源"
      ],
      "disabled": false,
      "size": "small",
      "default": "",
      "variant": "standard",
      "color": "info",
      "fullWidth": true
    },
    "type_of_role": {
      "title": "租户角色",
      "type": "number",
      "widget": "select",
      "required": true,
      "enum": [
        1,
        2,
        3
      ],
      "enumNames": [
        "无",
        "租户属主",
        "业务组属主"
      ],
      "disabled": false,
      "size": "small",
      "default": "",
      "variant": "standard",
      "color": "info",
      "fullWidth": true
    },
    "ops": {
      "title": "操作",
      "type": "array",
      "widget": "multiSelect",
      "size": "small",
      "enum": [],
      "enumNames": [],
      "required": true,
      "items": {
        "type": "object",
        "properties": {}
      },
      "disabled": false,
      "default": "",
      "variant": "standard",
      "color": "primary"
    }
  }
};

@observer
export class EditDialog extends FormRenderDialog {

  @observable static ok: boolean = false;
  @observable static data: Resource = null;
  subTitle = '配置资源';

  schema = schema;

  static open(data: Resource) {
    EditDialog.data = data;
    EditDialog.ok = true;
  }

  close() {
    EditDialog.ok = false;
  }

  @computed get isOpen() {
    return EditDialog.ok;
  }

  @computed get object(): Resource {
    return EditDialog.data;
  }

  in = () => {
    this.formData = {
      apiversion: this.object.spec.apiVersion || '',
      group: this.object.spec.group,
      menu: this.object.spec.menu,
      ops: this.object.spec.ops,
      type: this.object.spec.type,
      type_of_role: this.object.spec.type_of_role,
    };
  };

  out = () => {
    let formData = {};
    formData['metadata'] = {
      name: this.formData['name'],
    };
    formData['spec'] = {
      menu: this.formData['menu'],
      apiVersion: this.formData['apiversion'],
      group: this.formData['group'],
      ops: this.formData['ops'],
      type: this.formData['type'],
      type_of_role: this.formData['type_of_role'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    const object: Partial<Resource> = this.formData;
    resourceStore
      .update(this.object, object, { path: "spec.menu,spec.apiVersion,sepc.group,spec.ops,spec.type,spec.type_of_role" })
      .then(() => {
        Notifications.ok(`${object.metadata.name} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };

  onMount = form => {
    operationStore.api.query().
      then(ops => {
        const tmp = ops.map(op => op.getName());
        form.setSchemaByPath('ops', {
          enum: tmp,
          enumNames: tmp,
        });
      });

    menuStore.api.query().
      then(menus => {
        const tmp = menus.map(menu => menu.getName());
        form.setSchemaByPath('menu', {
          enum: tmp,
          enumNames: tmp,
        });
      })
  };
}
