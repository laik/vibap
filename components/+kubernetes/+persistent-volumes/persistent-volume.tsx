import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import {DialAction, Panel, PanelProps} from '../../template';
import Notifications from '../../template/notification';
import {withRouter} from '../../withRouter';
import {
  PersistentVolume,
  persistentVolumeApi,
  persistentVolumeStore,
} from './persistent-volume.store';
import PersistentVolumeDetails from './persistent-volumes.details';

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
    name: 'storageclass',
    header: 'Storage class',
    defaultFlex: 1,
  },
  {
    name: 'capacity',
    header: '容量',
    defaultFlex: 1,
  },
  {
    name: 'claim',
    header: 'claim',
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
@storeables(apiManager.getStores(['persistentvolumes']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
  ];
  @computed get title(): string {
    return 'Persistent Volume';
  }

  delete = object => {
    persistentVolumeStore
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
    return persistentVolumeStore.isLoading;
  }

  @computed get allItems() {
    return persistentVolumeStore.items;
  }

  @computed get selectedItem() {
    return persistentVolumeStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: PersistentVolume) =>
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

  renderTableContents(item: PersistentVolume) {
    return {
      id: item.getId(),
      name: item.getName(),
      storageclass: item.spec.storageClassName,
      capacity: item.getCapacity(),
      claim: item.getClaimRefName(),
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
                persistentVolumeApi,
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

apiManager.registerViews(persistentVolumeApi, {
  Details: PersistentVolumeDetails,
});
