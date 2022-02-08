import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import { DialAction, Panel, PanelProps } from '../../template/panel';
import { withRouter } from '../../withRouter';
import { AddDialog } from './add-dialog';
import { EditDialog } from './edit-dialog';
import { GrantDialog } from './grant-dialog';
import { ProviderDialog } from './provider-dialog';
import { Tenant, tenantApi, tenantStore as store, tenantThridTools } from './store';

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
    name: 'thirdtype',
    header: '第三方工具',
    defaultFlex: 1,
  },
  {
    name: 'key',
    header: '唯一标识',
    defaultFlex: 1,
  },
  {
    name: 'owner',
    header: '属主帐户',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['tenant', 'menu', 'resource']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '属主帐户',
      field: 'owner',
      type: 'text',
    },
  ];

  @computed get title(): string {
    return '租户';
  }

  delete = object => {
    store
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
    return store.isLoading;
  }

  @computed get allItems() {
    return store.items;
  }

  @computed get selectedItem() {
    return store.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Tenant) => this.renderTableContents(item));
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

  renderTableContents(item: Tenant) {
    return {
      id: item.getId(),
      name: item.getName(),
      owner: item.spec.owner,
      thirdtype: tenantThridTools[item.spec.type],
      key: item.spec.key,
      IObject: item,
    };
  }

  renderRowContextMenu = (menuProps, {cellProps}) => {
    menuProps.autoDismiss = true;
    menuProps.items = [
      {
        label: '配置',
        onClick: () => EditDialog.open(cellProps.data.IObject),
      },
      {
        label: '删除',
        onClick: () => this.delete(cellProps.data.IObject),
      },
    ];
  };

  customRowContextMenu = cellProps => {
    return [
      {
        label: '详情',
        onClick: () => {
          this.props.router.push({
            query: {
              details: createSelfLink(
                tenantApi,
                cellProps.data.IObject.getName(),
                cellProps.data.IObject.getNs()
              ),
            },
          });
        },
      },
      {
        label: '绑定租户属主',
        onClick: () => EditDialog.open(cellProps.data.IObject),
      },
      {
        label: '授权',
        onClick: () => GrantDialog.open(cellProps.data.IObject),
      },
      {
        label: '授权访问供应商',
        onClick: () => ProviderDialog.open(cellProps.data.IObject),
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
        <EditDialog />
        <AddDialog />
        <ProviderDialog />
        <GrantDialog />
      </>
    );
  };
}
