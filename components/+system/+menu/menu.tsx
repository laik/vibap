import {computed} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import {DialAction, Panel, PanelProps} from '../../template/panel';
import {withRouter} from '../../withRouter';
import {AddDialog} from './add-dialog';
import {EditDialog} from './edit-dialog';
import Details from './menu.details';
import {Menu, menuApi as api, menuStore as store} from './menu.store';

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
    name: 'link',
    header: '链接',
    defaultFlex: 1,
  },
  {
    name: 'title',
    header: '标题',
    defaultFlex: 1,
  },
  {
    name: 'icon',
    header: '图标',
    defaultFlex: 1,
  },
  {
    name: 'level',
    header: '菜单等级',
    defaultFlex: 1,
  },
  {
    name: 'is_sub_menu',
    header: '是否显示业务菜单',
    defaultFlex: 1,
  },
  {
    name: 'parent',
    header: '父菜单',
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
@storeables(apiManager.getStores(['menu']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
  ];

  @computed get title(): string {
    return '菜单';
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

  // @computed get filterColumns() {
  //   return filterColumns;
  // }

  @computed get rows() {
    return this.allItems.map((item: Menu) => this.renderTableContents(item));
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

  renderTableContents(item: Menu) {
    return {
      id: item.getId(),
      name: item.getName(),
      link: item.spec.link,
      title: item.spec.title,
      icon: item.spec.icon,
      type: item.spec.type,
      level: String(item.spec.level),
      is_sub_menu: String(item.spec.is_sub_menu),
      parent: item.parentMenu(),
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
                api,
                cellProps.data.IObject.getName(),
                cellProps.data.IObject.getNs()
              ),
            },
          });
        },
      },
      {
        label: '编辑',
        onClick: () => EditDialog.open(cellProps.data.IObject),
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
        <EditDialog />
      </>
    );
  };
}

apiManager.registerViews(api, {Details: Details});
