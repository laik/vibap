import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import { DialAction, Panel, PanelProps } from '../../template';
import Notifications from '../../template/notification';
import { withRouter } from '../../withRouter';
import { AccountDialog } from './account';
import Details from './details';
import { User, userApi, userStore } from './store';

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
  },
  {
    name: 'name',
    header: '用户',
    defaultFlex: 1,
  },
  {
    name: 'cnName',
    header: '名称',
    defaultFlex: 1,
  },
  {
    name: 'tenant',
    header: '租户',
    defaultFlex: 1,
  },
  {
    name: 'workspace',
    header: '工作空间',
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
@storeables(apiManager.getStores(['user', 'account']))
export default class Layout extends Panel<PanelProps> {


  @computed get title(): string {
    return '用户';
  }

  delete = object => {
    userStore
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
    return userStore.isLoading;
  }

  @computed get allItems() {
    return userStore.items;
  }

  @computed get selectedItem() {
    return userStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: User) => this.renderTableContents(item));
  }

  @computed get dial(): DialAction[] {
    var items = [
      {
        key: 'delete',
        title: '删除',
        icon: 'delete',
        action: this.patchDelete,
      },
    ];
    return items;
  }

  renderTableContents(item: User) {
    return {
      id: item.getId(),
      name: item.getName(),
      cnName: item.spec.cn_name,
      tenant: item.getTenant(),
      workspace: item.getNs(),
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
                userApi,
                cellProps.data.IObject.getName(),
                cellProps.data.IObject.getNs()
              ),
            },
          });
        },
      },
      {
        label: '绑定账户',
        onClick: () => AccountDialog.open(cellProps.data.IObject),
      },
    ].concat(
      this.selected_list.length > 0
        ? [
            {
              label: '删除',
              onClick: () => this.delete(cellProps.data.IObject),
            },
          ]
        : []
    );
  };

  dialog = () => {
    return (
      <>
        <AccountDialog />
      </>
    );
  };
}

apiManager.registerViews(userApi, {Details: Details});
