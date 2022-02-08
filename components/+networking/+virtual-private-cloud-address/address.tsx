import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import { DialAction, Panel, PanelProps } from '../../template/panel';
import { withRouter } from '../../withRouter';
import AddressDetails from './address.details';
import { Address, addressApi, addressStore } from './address.store';

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
    name: 'ipforsort',
    header: '外部地址',
    defaultFlex: 1,
  },
  {
    name: 'area',
    header: '区域',
    defaultFlex: 1,
  },
  {
    name: 'type',
    header: '类型',
    defaultFlex: 1,
  },
  {
    name: 'ipversion',
    header: '版本',
    defaultFlex: 1,
  },
  {
    name: 'user',
    header: '使用者',
    defaultFlex: 1,
  },
  {
    name: 'networktier',
    header: '网络层',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['address']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '外部地址',
      field: 'ipforsort',
      type: 'text',
    },
    {
      label: '区域',
      field: 'area',
      type: 'text',
    },
    {
      label: '类型',
      field: 'type',
      type: 'text',
    },
    {
      label: '版本',
      field: 'ipversion',
      type: 'text',
    },
    {
      label: '使用者',
      field: 'user',
      type: 'text',
    },
  ];

  @computed get title(): string {
    return '外部IP地址';
  }

  delete = object => {
    addressStore
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
    return addressStore.isLoading;
  }

  @computed get allItems() {
    return addressStore.items;
  }

  @computed get selectedItem() {
    return addressStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Address) => this.renderTableContents(item));
  }

  @computed get dial(): DialAction[] {
    var items = [].concat(
      this.selected_list.length > 0
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

  renderTableContents(item: Address) {
    return {
      id: item.getId(),
      name: item.getName(),
      ipforsort: item.spec.ipforsort,
      area: item.spec.area,
      type: item.spec.type,
      ipversion: item.spec.ipversion,
      user: item.spec.user,
      networktier: item.spec.networktier,
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
                addressApi,
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

apiManager.registerViews(addressApi, {Details: AddressDetails});
