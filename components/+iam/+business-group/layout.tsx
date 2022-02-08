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
import { BindOwnerDialog } from './bind-owner-dialog';
import Details from './details';
import { BusinessGroup, businessGroupApi, businessGroupStore } from './store';

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
    name: 'owner',
    header: '属主帐户',
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
    name: 'owner',
    header: '属主帐户',
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
@storeables(apiManager.getStores(['businessgroup']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '租户',
      field: 'tenant',
      type: 'text',
    },
    {
      label: '属主帐户',
      field: 'owner',
      type: 'text',
    },
  ];

  userConfig = redux_userconfig()

  moreMenuButton =
    this.userConfig.roleType === 3 || this.userConfig.isTenantOwner || false;
  @computed get title(): string {
    return '业务组';
  }

  delete = object => {
    businessGroupStore
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
    return businessGroupStore.isLoading;
  }

  @computed get allItems() {
    return businessGroupStore.items;
  }

  @computed get selectedItem() {
    return businessGroupStore.getAllByNs([]);
  }

  @computed get columns() {
    return this.userConfig.roleType == 3 ? columns1 : columns2;
  }

  @computed get rows() {
    return this.allItems.map((item: BusinessGroup) =>
      this.renderTableContents(item)
    );
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

  renderTableContents(item: BusinessGroup) {
    return {
      id: item.getId(),
      tenant: item.getTenant(),
      name: item.getName(),
      owner: item.spec.owner,
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
                businessGroupApi,
                cellProps.data.IObject.getName(),
                cellProps.data.IObject.getNs()
              ),
            },
          });
        },
      },
      {
        label: '绑定属主',
        onClick: () => BindOwnerDialog.open(cellProps.data.IObject),
      },
      {
        label: '删除',
        onClick: () => this.delete(cellProps.data.IObject),
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
        <AddDialog />
        <BindOwnerDialog />
      </>
    );
  };
}

apiManager.registerViews(businessGroupApi, { Details: Details });