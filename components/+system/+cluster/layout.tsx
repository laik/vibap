import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import { DialAction, Panel, PanelProps } from '../../template/panel';
import { withRouter } from '../../withRouter';
import { AddDialog } from './add-dialog';
import ClusterDetails from './details';
import { Cluster, clusterApi, clusterStore } from './store';

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
  {
    name: 'az',
    header: '可用区',
    defaultFlex: 1,
  },
  {
    name: 'config',
    header: '配置',
    defaultFlex: 1,
  },
  {
    name: 'updatetime',
    header: '更新时间',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(
  apiManager.getStores(['cluster', 'provider', 'region', 'availablezone'])
)
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
    {
      label: '可用区',
      field: 'az',
      type: 'text',
    },
  ];

  @computed get title(): string {
    return 'Kubernetes 集群配置';
  }

  delete = object => {
    clusterStore
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
    return clusterStore.isLoading;
  }

  @computed get allItems() {
    return clusterStore.items;
  }

  @computed get selectedItem() {
    return clusterStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Cluster) => this.renderTableContents(item));
  }

  @computed get dial(): DialAction[] {
    var items = [
      {
        key: 'add',
        title: '新增',
        icon: 'add',
        action: () => AddDialog.open(),
      },
    ].concat(
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

  renderTableContents(item: Cluster) {
    return {
      id: item.getId(),
      name: item.getName(),
      region: item.spec.region,
      provider: item.spec.provider,
      az: item.spec.az,
      updatetime: item.getUpdateTime(),
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
                clusterApi,
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

  dialog = () => {
    return (
      <>
        <AddDialog />
      </>
    );
  };
}

apiManager.registerViews(clusterApi, {Details: ClusterDetails});
