import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { User, userStore } from '../../+iam/+user/store';
import { FormRenderDialog } from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import { Tenant, tenantStore } from './store';

const schema = {
  type: 'object',
  properties: {
    owner: {
      title: '租户属主',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],
      disabled: false,
      size: 'small',
      default: '',

      color: 'info',
      fullWidth: true,
    },
  },
  labelWidth: 120,
  displayType: 'row',
};

@observer
export class EditDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  @observable static data: Tenant;

  subTitle = '绑定租户属主';
  schema = schema;

  static open(data: Tenant) {
    EditDialog.ok = true;
    EditDialog.data = data;
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

  onMount = form => {
    userStore.
      api.
      query({}, { "tenant_name": this.object.getName() }).
      then(users => {
        let userObjects = new Map<string, string>();
        users.forEach(
          (user: User) => {
            userObjects.set(user.getName(), user.spec.cn_name);
          });
        form.setSchemaByPath('owner', {
          enum: Array.from(userObjects.keys()) || [],
          enumNames: Array.from(userObjects.values()) || [],
        });
      });
  };

  in = () => {
    this.formData = {
      owner: this.object.spec.owner,
    };
  };

  out = () => {
    let formData = {};
    formData['metadata'] = {
      name: this.formData['name'],
    };
    formData['spec'] = {
      owner: this.formData['owner'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    const object: Partial<Tenant> = this.formData;
    tenantStore
      .update(this.object, object, { path: 'spec.owner' })
      .then(() => {
        Notifications.ok(`${this.object.getName()} save succeeded`);
        this.close();
      })
      .catch(err => {
        Notifications.error(err);
      });
  };
}
