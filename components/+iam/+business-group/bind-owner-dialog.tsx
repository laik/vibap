import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {userStore} from '../+user/store';
import {redux_userconfig} from '../../../client/redux-store';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import {BusinessGroup, businessGroupStore} from './store';

const schema = {
  type: 'object',
  properties: {
    owner: {
      title: '绑定属主',
      type: 'string',
      widget: 'select',
      required: true,
      enum: [],
      enumNames: [],
    },
  },
  labelWidth: 120,
  displayType: 'row',
};

@observer
export class BindOwnerDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  @observable static data: BusinessGroup = null;
  @observable static owner: string = '';
  // inTrigger = true;
  schema = schema;
  userconfig = redux_userconfig();
  userMap = new Map<string, string>();

  subTitle = '绑定属主';

  static open(data: BusinessGroup) {
    BindOwnerDialog.data = data;
    BindOwnerDialog.ok = true;
  }

  close() {
    BindOwnerDialog.ok = false;
  }

  @computed get object() {
    return BindOwnerDialog.data;
  }

  @computed get default_owner() {
    return BindOwnerDialog.owner;
  }

  @computed get isOpen() {
    return BindOwnerDialog.ok;
  }

  in = () => {
    this.formData = {
      owner: this.default_owner,
    };
  };

  out = () => {
    let formData = {};
    formData['spec'] = {
      owner: this.formData['owner'],
      ownerName: this.userMap.get(formData['owner']),
    };

    this.formData = formData;
  };

  onFinish = () => {
    const object: Partial<BusinessGroup> = this.formData;
    businessGroupStore
      .update(this.object, object, {path: 'spec.owner,spec.ownerName'})
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
    var users: string[] = [];
    var userNames: string[] = [];
    const isAdmin = this.userconfig.roleType === 3;

    if (isAdmin) {
      userStore.api
        .query({}, {tenant: this.object.getTenant()})
        .then(objects => {
          objects.forEach(object => {
            users.push(object.getName());
            userNames.push(object.spec.cn_name);
            this.userMap.set(object.getName(), object.spec.cn_name);
          });

          form.setSchemaByPath('owner', {
            enum: users,
            enumNames: userNames,
          });
        });
    } else {
      userStore.api.query({}).then(objects => {
        objects
          .filter(object => object.getName() != this.userconfig.userName) // 去掉自己
          .forEach(object => {
            users.push(object.getName());
            userNames.push(object.spec.cn_name);
            this.userMap.set(object.getName(), object.spec.cn_name);
          });
        form.setSchemaByPath('owner', {
          enum: users,
          enumNames: users,
        });
      });
    }
    BindOwnerDialog.owner = this.object?.spec?.owner;
  };
}
