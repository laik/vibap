import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import { redux_userconfig } from '../../../client/redux-store';
import { DialAction, Panel, PanelProps } from '../../template';
import Notifications from '../../template/notification';
import { withRouter } from '../../withRouter';
import { AddDialog } from './add-dialog';
import RoleDetails from './details';
import { GrantDialog } from './grant-dialog';
import { Role, roleApi, roleStore } from './store';

const columns1 = [
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
    name: 'tenant',
    header: '租户',
    defaultFlex: 1,
  },
  {
    name: 'business',
    header: '业务组',
    defaultFlex: 1,
  },
  {
    name: 'remark',
    header: '备注',
    defaultFlex: 1,
  },
  {
    name: 'updatetime',
    header: '更新时间',
    defaultFlex: 1,
  },
];


const columns2 = [
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
    name: 'business',
    header: '业务组',
    defaultFlex: 1,
  },
  {
    name: 'remark',
    header: '备注',
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
@storeables(apiManager.getStores(['role']))
export default class Layout extends Panel<PanelProps> {

  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'radio',
    },
    {
      label: '租户',
      field: 'tenant',
      type: 'text',
    },
    {
      label: '业务组',
      field: 'business',
      type: 'text',
    },
  ];

  userConfig = redux_userconfig();

  @computed get title(): string {
    return '角色';
  }

  delete = object => {
    roleStore
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
    return roleStore.isLoading;
  }

  @computed get allItems() {
    return roleStore.items;
  }

  @computed get selectedItem() {
    return roleStore.getAllByNs([]);
  }

  @computed get columns() {
    return this.userConfig.roleType === 3 ? columns1 : columns2;
  }

  @computed get rows() {
    return this.allItems.map((item: Role) => this.renderTableContents(item));
  }

  @computed get dial(): DialAction[] {
    var items = [
      {
        key: 'add',
        title: '新增',
        icon: 'add',
        action: () => AddDialog.open(),
      },
      {
        key: 'delete',
        title: '删除',
        icon: 'delete',
        action: this.patchDelete,
      },
    ];
    return items;
  }

  renderTableContents(item: Role) {
    return {
      id: item.getId(),
      name: item.getName(),
      tenant: item.getTenant(),
      updatetime: item.getUpdateTime(),
      business: item.spec.business,
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
                roleApi,
                cellProps.data.IObject.getName(),
                cellProps.data.IObject.getNs()
              ),
            },
          });
        },
      },
      {
        label: '授权',
        onClick: () => GrantDialog.open(cellProps.data.IObject),
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
        <GrantDialog />
        <AddDialog />
      </>
    );
  };
}

apiManager.registerViews(roleApi, { Details: RoleDetails });
