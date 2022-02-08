import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { businessGroupStore } from '../+business-group/store';
import { roleStore } from '../+role/store';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import { redux_userconfig } from '../../../client/redux-store';
import Notifications from '../../template/notification';
import { DialAction, Panel, PanelProps } from '../../template/panel';
import { withRouter } from '../../withRouter';
import { AddDialog } from './add-dialog';
import AccountDetails from './details';
import { GrantBizDialog } from './grantbiz-diaglog';
import { Account, accountApi, accountStore, accountTypeMap } from './store';

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
    name: 'userName',
    header: '用户名',
    defaultFlex: 1,
  },
  {
    name: 'email',
    header: '邮箱',
    defaultFlex: 1,
  },
  {
    name: 'accountType',
    header: '账户类型',
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
    name: 'userName',
    header: '用户名',
    defaultFlex: 1,
  },
  {
    name: 'email',
    header: '邮箱',
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
@storeables(apiManager.getStores(['account', 'role', 'businessgroup']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '用户名',
      field: 'userName',
      type: 'text',
    },
  ];

  userConfig = redux_userconfig();
  ref = [roleStore, businessGroupStore];

  @computed get title(): string {
    return '账户';
  }

  delete = object => {
    accountStore
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
    return accountStore.isLoading;
  }

  @computed get allItems() {
    return accountStore.items;
  }

  @computed get selectedItem() {
    return accountStore.getAllByNs([]);
  }

  @computed get columns() {
    return this.userConfig.roleType === 3 ? columns1 : columns2;
  }

  @computed get rows() {
    return this.allItems.map((item: Account) => this.renderTableContents(item));
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

  renderTableContents(item: Account) {
    return {
      id: item.getId(),
      name: item.getName(),
      tenant: item.getTenant(),

      accountType: accountTypeMap[item.getAccountType()],
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
                accountApi,
                cellProps.data.IObject.getName(),
                cellProps.data.IObject.getNs()
              ),
            },
          });
        },
      },
      {
        label: '关联业务组',
        onClick: () => GrantBizDialog.open(cellProps.data.IObject),
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
        <GrantBizDialog />
      </>
    );
  };
}

apiManager.registerViews(accountApi, { Details: AccountDetails });
