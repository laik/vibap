import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { menuStore } from '../+menu/menu.store';
import { operationStore } from '../+operation/store';
import { FormRenderDialog } from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import { Resource, resourceStore } from './store';

const schema = {
  "type": "object",
  "labelWidth": 60,
  "displayType": "row",
  "properties": {
    "name": {
      "title": "名字",
      "type": "string",
      "widget": "input",
      "html5type": "text",
      "default": "",
      "disabled": false,
      "maxRows": "5",
      "minRows": "1",
      "size": "small",
      "label": "标签",
      "color": "primary",
      "required": true
    },
    "resourcename": {
      "title": "资源名",
      "type": "string",
      "widget": "input",
      "html5type": "text",
      "required": true,
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
    "group": {
      "title": "组",
      "type": "string",
      "widget": "input",
      "html5type": "text",
      "required": true,
      "default": "",
      "disabled": false,
      "maxRows": "5",
      "minRows": "1",
      "size": "small",
      "label": "标签",
      "color": "primary"
    },
    "kind": {
      "title": "类型",
      "type": "string",
      "widget": "input",
      "html5type": "text",
      "required": true,
      "default": "",
      "disabled": false,
      "maxRows": "5",
      "minRows": "1",
      "size": "small",
      "label": "标签",
      "color": "primary",
      "variant": "standard",
      "multiline": "false",
      "startAdornment": "",
      "endAdornment": ""
    },
    "type": {
      "title": "访问类型",
      "type": "number",
      "widget": "select",
      "required": true,
      "enum": [
        1,
        2,
      ],
      "enumNames": [
        "私有资源",
        "公共资源",
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
      }
    }
  }
};

@observer
export class AddDialog extends FormRenderDialog {

  @observable static ok: boolean = false;

  subTitle = '新增资源';
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
      resourcename: this.formData['resourcename'],
      menu: this.formData['menu'],
      apiversion: this.formData['apiversion'],
      group: this.formData['group'],
      kind: this.formData['kind'],
      ops: this.formData['ops'],
      type: this.formData['type'],
      type_of_role: this.formData['type_of_role'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    const object: Partial<Resource> = this.formData;
    resourceStore
      .create({ name: object.metadata.name }, object)
      .then(() => {
        Notifications.ok(`resource ${object.metadata.name} save succeeded`);
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
