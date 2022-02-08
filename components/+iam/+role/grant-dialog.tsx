import { computed, observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { redux_userconfig } from '../../../client/redux-store';
import { nestMapToObject } from '../../../client/utils/toobject';
import { XRenderBTree } from '../../../client/utils/tree';
import { FormRenderDialog } from '../../template/form';
import Notifications from '../../template/notification';
import { Role, roleStore } from './store';

const schema = {
  type: 'object',
  labelWidth: 40,
  displayType: 'row',
  properties: {
    tree: {
      title: '',
      type: 'any',
      widget: 'tree',
      treeData: [],
    },
  },
};

@observer
export class GrantDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  @observable static data: Role = null;
  @observable static treeData: {} = {};
  @observable static default_data = observable.array([], { deep: false });

  subTitle = '授权';
  schema = schema;
  userConfig = redux_userconfig();

  static open(data: Role) {
    GrantDialog.data = data;
    GrantDialog.ok = true;
  }

  close() {
    GrantDialog.ok = false;
  }

  @computed get isOpen() {
    return GrantDialog.ok;
  }

  @computed get object() {
    return GrantDialog.data;
  }

  @computed get tree() {
    return GrantDialog.treeData;
  }

  @computed get default_object() {
    return GrantDialog.default_data;
  }

  in = () => {
    this.formData = { tree: toJS(this.default_object) };
  };

  out = () => {
    let formData = {};
    const permission = this.group(this.formData['tree']);
    formData = {
      metadata: {
        name: this.object.getName(),
        Tenant: this.object.getNs(),
      },
    };
    formData = {
      spec: {
        permission: nestMapToObject(permission),
      },
    };

    this.formData = formData;
  };

  group = (data: string[]): Map<string, any> => {
    let r3 = new Map<string, any>();
    let r4 = new Map<string, any>();
    data.forEach(item => {
      const items = item.split('.');
      switch (items.length) {
        case 3:
          const [p, a, o] = items;
          let action;
          let ops: string[];

          if (!r3.has(p)) {
            action = new Map<string, string[]>();
            r3.set(p, action);
          } else {
            action = r3.get(p);
          }

          if (!action.has(a)) {
            ops = [];
            action.set(a, ops);
          } else {
            ops = action.get(a);
          }

          ops.push(o);

          break;
        case 4:
          const [p1, a1, a2, o1] = items;
          let action1: Map<string, any>;
          let action2: Map<string, string[]>;
          let ops1: string[];

          if (!r4.has(p1)) {
            action1 = new Map<string, any>();
            r4.set(p1, action1);
          } else {
            action1 = r4.get(p1);
          }

          if (!action1.has(a1)) {
            action2 = new Map<string, string[]>();
            action1.set(a1, action2);
          } else {
            action2 = action1.get(a1);
          }

          if (!action2.has(a2)) {
            ops1 = [];
            action2.set(a2, ops1);
          } else {
            ops1 = action2.get(a2);
          }

          ops1.push(o1);
          break;
      }
    });
    return new Map([...r3.entries(), ...r4.entries()]);
  };

  onFinish = () => {
    const object: Partial<Role> = this.formData;
    roleStore
      .update(this.object, object, { path: 'spec.permission' })
      .then(() => {
        Notifications.ok(`${this.object.getName()} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };

  isPlainObject(input): boolean {
    return input && !Array.isArray(input) && typeof input === 'object';
  }

  onMount = form => {
    // first clean default_data content
    GrantDialog.default_data.length = 0;
    GrantDialog.default_data.push(...GrantDialog.data.getPermissedToTree());


    if (this.userConfig.roleType === 3) {
      //
    }
    const data = this.userConfig.permission &&
      Object.entries(this.userConfig.permission).
        map(([product, actions]) => {
          const firstName = product;
          let first = new XRenderBTree(firstName, firstName);
          // second
          actions && Object.entries(actions).
            forEach(([action, actions2]) => {
              const second = XRenderBTree.addChildToPatent(action, action, first);
              // three
              if (this.isPlainObject(actions2)) {
                actions2 && Object.entries(actions2).
                  forEach(([action2, ops]) => {
                    const three = XRenderBTree.addChildToPatent(action2, action2, second);
                    ops && Object.entries(ops).
                      forEach(([_, op]) => {
                        // XRenderBTree.addChildToPatent(op, op, three);
                      })
                  });
              } else {
                actions2 &&
                  Object.entries(actions2).
                    forEach(([_, op]) => {
                      XRenderBTree.addChildToPatent(op, op, second);
                    });
              }
            });
          return first;
        });


    const treeData = {
      title: '',
      treeData: data,
      type: 'any',
      widget: 'tree',
    };
    form.setSchemaByPath('tree', treeData);
  };

}
