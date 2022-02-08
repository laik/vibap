import { computed, observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { redux_userconfig } from '../../../client/redux-store';
import { UserConfig } from '../../../client/user-config';
import { XRenderBTree } from '../../../client/utils/tree';
import { delay } from '../../template/form';
import { FormRenderDialog } from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';
import { Tenant, tenantStore } from './store';

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
export class ProviderDialog extends FormRenderDialog {
  @observable static ok: boolean = false;
  @observable static data: Tenant = null;
  @observable static treeData: {} = {};
  @observable static default_data = observable.array([], {deep: false});
  subTitle = '授权访问供应商';
  schema = schema;

  static open(data: Tenant) {
    ProviderDialog.data = data;
    ProviderDialog.ok = true;
  }

  close() {
    ProviderDialog.ok = false;
  }

  @computed get isOpen() {
    return ProviderDialog.ok;
  }

  @computed get object() {
    return ProviderDialog.data;
  }

  @computed get tree() {
    return ProviderDialog.treeData;
  }

  @computed get default_object() {
    return ProviderDialog.default_data;
  }

  in = () => {
    this.formData = {tree: toJS(this.default_object)};
  };

  out = () => {
    let formData = {};
    const allowed = Array.from(
      this.group(this.formData['tree']).entries()
    ).reduce(
      (main, [key, value]) => ({
        ...main,
        [key]: Array.from(value.entries()).reduce(
          (main, [key, value]) => ({...main, [key]: value}),
          {}
        ),
      }),
      {}
    );
    formData = {
      metadata: {
        name: this.object.getName(),
      },
    };
    formData = {
      spec: {
        allowed: allowed,
      },
    };
    this.formData = formData;
  };

  group = (data: string[]): Map<string, Map<string, string[]>> => {
    let result = new Map<string, Map<string, string[]>>();
    data.forEach(item => {
      const values = item.split('.');
      // P1.R1.A1
      if (values.length != 3) return;
      if (!result.has(values[0])) {
        result.set(values[0], new Map<string, string[]>());
      }
      if (!result.get(values[0]).has(values[1])) {
        result.get(values[0]).set(values[1], []);
      }
      result.get(values[0]).get(values[1]).push(values[2]);
    });
    return result;
  };

  onFinish = () => {
    const object: Partial<Tenant> = this.formData;
    tenantStore
      .update(this.object, object, { path: "spec.allowed" })
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
    ProviderDialog.default_data.length = 0;
    ProviderDialog.default_data.push(
      ...ProviderDialog.data.getAllowedTreeKeys()
    );

    const userConfig: UserConfig = redux_userconfig();
    const providers = Object.entries(userConfig.providers);

    const data = providers.map(([_, items]) => {
      let p = new XRenderBTree(items.localName, items.localName);
      items.regions &&
        items.regions.forEach(region => {
          const regionChild = XRenderBTree.addChildToPatent(
            region.localName,
            region.localName,
            p
          );
          region.azs &&
            region.azs.forEach(az => {
              XRenderBTree.addChildToPatent(
                az.localName,
                az.localName,
                regionChild
              );
            });
        });
      return p;
    });
    const treeData = {
      title: '',
      treeData: data,
      type: 'any',
      widget: 'tree',
    };
    delay(0).then(_ => {
      form.setSchemaByPath('tree', treeData);
    });
  };
}
