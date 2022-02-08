import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import {DialAction, Panel, PanelProps} from '../../template';
import Notifications from '../../template/notification';
import {withRouter} from '../../withRouter';
import StorageClassesDetails from './storage-classes.details';
import {
  StorageClasses,
  storageClassesApi,
  storageClassesStore,
} from './storage-classes.store';

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
    name: 'provisioner',
    header: '制备器',
    defaultFlex: 1,
  },
  {
    name: 'reclaimpolicy',
    header: '回收策略',
    defaultFlex: 1,
  },
  {
    name: 'default',
    header: 'default',
    defaultFlex: 1,
  },
  {
    name: 'age',
    header: 'age',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['storageclasses']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
  ];
  @computed get title(): string {
    return 'StorageClasses';
  }

  delete = object => {
    storageClassesStore
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
    return storageClassesStore.isLoading;
  }

  @computed get allItems() {
    return storageClassesStore.items;
  }

  @computed get selectedItem() {
    return storageClassesStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: StorageClasses) =>
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

  renderTableContents(item: StorageClasses) {
    return {
      id: item.getId(),
      name: item.getName(),
      provisioner: item.provisioner,
      reclaimpolicy: item.getReclaimPolicy(),
      default: item.isDefault(),
      age: item.getAge(),
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
                storageClassesApi,
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

apiManager.registerViews(storageClassesApi, {Details: StorageClassesDetails});
