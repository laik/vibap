import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import { DialAction, Panel, PanelProps } from '../../template/panel';
import { withRouter } from '../../withRouter';
import RegionDetails from './instancetype.details';
import {
    InstanceType,
    instanceTypeApi,
    instanceTypeStore
} from './instancetype.store';

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
    name: 'provider',
    header: '供应商',
    defaultFlex: 1,
  },
  {
    name: 'region',
    header: '区域',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['instancetype']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '供应商',
      field: 'provider',
      type: 'text',
    },
    {
      label: '区域',
      field: 'region',
      type: 'text',
    },
  ];

  @computed get title(): string {
    return '实例类型';
  }

  delete = object => {
    instanceTypeStore
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
    return instanceTypeStore.isLoading;
  }

  @computed get allItems() {
    return instanceTypeStore.items;
  }

  @computed get selectedItem() {
    return instanceTypeStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: InstanceType) =>
      this.renderTableContents(item)
    );
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

  renderTableContents(item: InstanceType) {
    return {
      id: item.getId(),
      name: item.getName(),
      region: item.spec.region,
      provider: item.getNamespace(),
      IObject: item,
    };
  }

  renderRowContextMenu = (menuProps, {cellProps}) => {
    menuProps.autoDismiss = true;
    menuProps.items = [
      {
        label: '详情',
        onClick: () => {
          this.props.router.push({
            query: {
              details: createSelfLink(
                instanceTypeApi,
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

apiManager.registerViews(instanceTypeApi, { Details: RegionDetails });
