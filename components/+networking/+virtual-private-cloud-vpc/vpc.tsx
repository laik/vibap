import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import { DialAction, Panel, PanelProps } from '../../template/panel';
import { withRouter } from '../../withRouter';
import { AddNetworkDialog } from './add-vpc-dialog';
import NetworkDetails from './vpc.details';
import { Vpc, vpcApi, vpcStore } from './vpc.store';

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
  },
  {
    name: 'objId',
    header: 'ID',
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
    name: 'ip',
    header: 'IP',
    defaultFlex: 1,
  },
  {
    name: 'mask',
    header: 'mask',
    defaultFlex: 1,
  },
  {
    name: 'vpcId',
    header: 'vpcId',
    defaultFlex: 1,
  },
  {
    name: 'localName',
    header: '备注名称',
    defaultFlex: 1,
  },
  {
    name: 'updatetime',
    header: '更新时间',
    defaultFlex: 1,
  },
  {
    name: 'status',
    header: '状态',
    valueType: 'tag',
    width: 100,
    valueEnum: {
      '1': {
        text: 'Active',
        color: 'green',
      },
      '0': {
        text: 'Pending',
        color: 'red',
      },
    },
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['vpc']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: 'ID',
      field: 'objId',
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
      label: 'IP',
      field: 'ip',
      type: 'text',
    },
  ];

  moreMenuButton = false;

  @computed get title(): string {
    return 'VPC网络';
  }

  delete = object => {
    vpcStore
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
    return vpcStore.isLoading;
  }

  @computed get allItems() {
    return vpcStore.items;
  }

  @computed get selectedItem() {
    return vpcStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Vpc) => this.renderTableContents(item));
  }

  @computed get dial(): DialAction[] {
    var items = [
      {
        key: 'add',
        title: '新增',
        icon: 'add',
        action: () => AddNetworkDialog.open(),
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

  renderTableContents(item: Vpc) {
    return {
      id: item.getId(),
      objId: item.getName(),
      localName: item.spec.local_name,
      ip: item.spec.ip,
      mask: item.spec.mask,
      provider: item.getNamespace(),
      region: item.spec.region,
      status: item.spec.status === 'running' ? 1 : 0,
      vpcId: item.spec.id,
      updatetime: item.getUpdateTime(),
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
                vpcApi,
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
        <AddNetworkDialog />
      </>
    );
  };
}

apiManager.registerViews(vpcApi, { Details: NetworkDetails });
