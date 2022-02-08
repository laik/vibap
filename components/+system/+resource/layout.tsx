import {computed} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import {DialAction, Panel, PanelProps} from '../../template/panel';
import {withRouter} from '../../withRouter';
import {AddDialog} from './add-dialog';
import ProductDetails from './details';
import {EditDialog} from './edit-dialog';
import {
  Resource,
  resourceApi as api,
  resourceStore as store,
  ResourceTypeMap,
  ResourceTypeOfRoleMap,
} from './store';

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
    name: 'resourcename',
    header: '资源名称',
    defaultFlex: 1,
  },
  {
    name: 'apiversion',
    header: '版本',
    defaultFlex: 1,
  },
  {
    name: 'group',
    header: '资源组',
    defaultFlex: 1,
  },
  {
    name: 'kind',
    header: '类型',
    defaultFlex: 1,
  },
  {
    name: 'type',
    header: '访问类型',
    defaultFlex: 1,
  },
  {
    name: 'type_of_role',
    header: '租户角色',
    defaultFlex: 1,
  },
  {
    name: 'menu',
    header: '业务菜单',
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
@storeables(apiManager.getStores(['resource', 'operation']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '资源名称',
      field: 'resourcename',
      type: 'text',
    },
    {
      label: '版本',
      field: 'apiversion',
      type: 'text',
    },
    {
      label: '资源组',
      field: 'group',
      type: 'text',
    },
    {
      label: '类型',
      field: 'kind',
      type: 'text',
    },
    {
      label: '访问类型',
      field: 'type',
      type: 'radio', // TODO: 改为下拉列表
      options: [
        {label: '公共资源', value: '公共资源'},
        {label: '私有资源', value: '私有资源'},
      ],
    },
    {
      label: '访问类型',
      field: 'type',
      type: 'radio', // TODO: 改为下拉列表
      options: [
        {label: '业务组属主', value: '业务组属主'},
        {label: '租户属主', value: '租户属主'},
        {label: '无', value: '无'},
      ],
    },
  ];

  @computed get title(): string {
    return '资源';
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
    return this.allItems.map((item: Resource) =>
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

  renderTableContents(item: Resource) {
    return {
      id: item.getId(),
      name: item.getName(),
      resourcename: item.spec.resourceName,
      apiversion: item.spec.apiVersion,
      group: item.spec.group,
      kind: item.spec.kind,
      type: ResourceTypeMap[item.spec.type],
      type_of_role: ResourceTypeOfRoleMap[item.spec.type_of_role],
      ops: item.spec.ops,
      menu: item.spec.menu,
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
        label: '资源配置',
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
        <EditDialog />
        <AddDialog />
      </>
    );
  };
}

apiManager.registerViews(api, {Details: ProductDetails});
