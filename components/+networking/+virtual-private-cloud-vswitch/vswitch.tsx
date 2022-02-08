import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import { DialAction, Panel, PanelProps } from '../../template/panel';
import { withRouter } from '../../withRouter';
import { AddVSwitchDialog } from './add-vswitch-dialog';
import NetworkDetails from './vswitch.details';
import { VSwitch, vSwitchApi, vswitchStore } from './vswitch.store';

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
    name: 'vswitchID',
    header: 'vswitchID',
    defaultFlex: 1,
  },
  {
    name: 'vpcID',
    header: 'vpcID',
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
@storeables(apiManager.getStores(['vswitch']))
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
    return 'VSwitch';
  }

  delete = object => {
    vswitchStore
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
    return vswitchStore.isLoading;
  }

  @computed get allItems() {
    return vswitchStore.items;
  }

  @computed get selectedItem() {
    return vswitchStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: VSwitch) => this.renderTableContents(item));
  }

  @computed get dial(): DialAction[] {
    var items = [
      {
        key: 'add',
        title: '新增',
        icon: 'add',
        action: () => AddVSwitchDialog.open(),
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

  renderTableContents(item: VSwitch) {
    return {
      id: item.getId(),
      objId: item.getName(),
      localName: item.spec.local_name,
      region: item.spec.region,
      ip: item.spec.ip,
      mask: item.spec.mask,
      provider: item.getNamespace(),
      vpcID: item.spec.vpc_id,
      status: item.spec.status === "running" ? 1 : 0,
      vswitchID: item.spec.id,
      updatetime:item.getUpdateTime(),
      IObject: item,
    };
  }

  renderRowContextMenu = (menuProps, { cellProps }) => {
    menuProps.autoDismiss = true;
    menuProps.items = [
      {
        label: '详情',
        onClick: () => {
          this.props.router.push({
            query: {
              details: createSelfLink(
                vSwitchApi,
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
        <AddVSwitchDialog />
      </>
    );
  };
}

apiManager.registerViews(vSwitchApi, { Details: NetworkDetails });
