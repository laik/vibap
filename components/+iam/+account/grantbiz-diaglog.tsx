import { computed, observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { businessGroupStore } from '../+business-group/store';
import { roleStore } from '../+role/store';
import { redux_userconfig } from '../../../client/redux-store';
import { nestMapToObject } from '../../../client/utils/toobject';
import { XRenderBTree } from '../../../client/utils/tree';
import { FormRenderDialog } from '../../template/form';
import Notifications from '../../template/notification';
import { Account, accountStore } from './store';

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
export class GrantBizDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  @observable static data: Account = null;
  @observable static treeData: {} = {};
  @observable static default_data = observable.array([], { deep: false });

  subTitle = '关联业务组';
  schema = schema;
  userConfig = redux_userconfig();

  static open(data: Account) {
    GrantBizDialog.data = data;
    GrantBizDialog.ok = true;
  }

  close() {
    GrantBizDialog.ok = false;
  }

  @computed get isOpen() {
    return GrantBizDialog.ok;
  }

  @computed get object() {
    return GrantBizDialog.data;
  }

  @computed get tree() {
    return GrantBizDialog.treeData;
  }

  @computed get default_object() {
    return GrantBizDialog.default_data;
  }

  in = () => {
    this.formData = { tree: toJS(this.default_object) };
  };

  out = () => {
    let formData = {};
    const bizGroupRole = this.group(this.formData['tree']);
    formData = {
      metadata: {
        name: this.object.getName(),
        Tenant: this.object.getNs(),
      },
    };
    formData = {
      spec: {
        business_group_role: nestMapToObject(bizGroupRole),
      },
    };

    this.formData = formData;
  };

  group = (data: string[]): Map<string, string[]> => {
    let result = new Map<string, string[]>();
    data.forEach((item) => {
      const bizRoles = item.split(".");
      if (bizRoles.length !== 2) {
        if (!result.has(bizRoles[0])) { result.set(bizRoles[0], []); }
        return
      }
      const [biz, role] = bizRoles;
      if (!result.has(biz)) { result.set(biz, []); }
      result.get(biz).push(role);
    })
    return result;
  }

  onFinish = () => {
    const object: Partial<Account> = this.formData;
    accountStore
      .update(this.object, object, { path: 'spec.business_group_role' })
      .then(() => {
        Notifications.ok(`${this.object.getName()} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };

  onMount = form => {
    // first clean default_data content
    GrantBizDialog.default_data.length = 0;
    GrantBizDialog.default_data.push(...GrantBizDialog.data.getBizTree());

    const data = businessGroupStore.
      items.
      map(item => {
        const biz = item.getName()
        let first = new XRenderBTree(biz, biz);
        // second
        roleStore.items.
          filter(role => role.spec.business === biz).
          forEach(role => {
            XRenderBTree.addChildToPatent(role.getName(), role.getName(), first);
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
