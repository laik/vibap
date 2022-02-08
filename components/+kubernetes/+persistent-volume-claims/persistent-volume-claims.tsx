import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import {DialAction, Panel, PanelProps} from '../../template';
import Notifications from '../../template/notification';
import {withRouter} from '../../withRouter';
import PersistentVolumeClaimDetails from './persistent-volume-claims.details';
import {
  PersistentVolumeClaim,
  persistentVolumeClaimApi,
  persistentVolumeClaimStore,
} from './persistent-volume-claims.store';

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
  },
  {
    name: 'name',
    header: '名称',
    defaultFlex: 1,
  },
  {
    name: 'namespace',
    header: '命名空间',
    defaultFlex: 1,
  },
  {
    name: 'storageclass',
    header: 'Storage class',
    defaultFlex: 1,
  },
  {
    name: 'size',
    header: 'size',
    defaultFlex: 1,
  },
  {
    name: 'pods',
    header: 'pods',
    defaultFlex: 1,
  },
  {
    name: 'age',
    header: 'age',
    defaultFlex: 1,
  },
  {
    name: 'status',
    header: 'status',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['persistentvolumeclaims']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '命名空间',
      field: 'namespace',
      type: 'text',
    },
  ];
  
  @computed get title(): string {
    return 'Persistent Volume Claims';
  }

  delete = object => {
    persistentVolumeClaimStore
      .remove(object)
      .then(() => Notifications.ok(`${object.getName()} delete succeeded`))
      .catch(err => Notifications.error(`${object.getName()} delete ` + err));
  };

  patchDelete = () => {
    this.selected_list.map(item => this.delete(item.IObject));
    this.selected_objs = {};
  };

  // table
  @computed get isLoading(): boolean {
    return persistentVolumeClaimStore.isLoading;
  }

  @computed get allItems() {
    return persistentVolumeClaimStore.items;
  }

  @computed get selectedItem() {
    return persistentVolumeClaimStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: PersistentVolumeClaim) =>
      this.renderTableContents(item)
    );
  }

  @computed get dial(): DialAction[] {
    var items = [].concat(
      this.selected_list.length
        ? [
            {
              key: 'delete',
              title: '删除',
              icon: 'delete',
              action: this.patchDelete,
            },
          ]
        : []
    );
    return items;
  }

  renderTableContents(item: PersistentVolumeClaim) {
    return {
      id: item.getId(),
      name: item.getName(),
      namespace: item.getNs(),
      storageclass: item.spec.storageClassName,
      size: item.getStorage(),
      pods: '',
      age: item.getAge(),
      status: item.getStatus(),
      IObject: item,
    };
  }

  customRowContextMenu = cellProps => {
    return [
      {
        label: '详情',
        onClick: () => {
          this.props.router.push({
            query: {
              details: createSelfLink(
                persistentVolumeClaimApi,
                cellProps.data.IObject.getName(),
                cellProps.data.IObject.getNs()
              ),
            },
          });
        },
      },
      {
        label: '删除',
        onClick: () => this.delete(cellProps.data.IObject),
      },
    ];
  };
}

apiManager.registerViews(persistentVolumeClaimApi, {
  Details: PersistentVolumeClaimDetails,
});
