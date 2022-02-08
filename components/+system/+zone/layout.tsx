import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { providerStore } from '../+provider/store';
import { regionStore } from '../+region/store';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import { DialAction, Panel, PanelProps } from '../../template/panel';
import { withRouter } from '../../withRouter';
import { AddDialog } from './add-dialog';
import Details from './details';
import { Zone, zoneApi, zoneStore } from './store';

const columns = [
  {
    name: 'id',
    header: 'id',
    defaultVisible: false,
    type: 'number',
  },
  {
    name: 'name',
    header: '名称',
    defaultFlex: 1,
  },
  {
    name: 'local_name',
    header: '本地名称',
    defaultFlex: 1,
  },
  {
    name: 'region',
    header: '区域',
    defaultFlex: 1,
  },

  {
    name: 'provider',
    header: '供应商',
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
@storeables(apiManager.getStores(['availablezone', 'provider', 'region']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '本地名称',
      field: 'local_name',
      type: 'text',
    },
    {
      label: '区域',
      field: 'region',
      type: 'text',
    },
    {
      label: '供应商',
      field: 'provider',
      type: 'text',
    },
  ];

  ref = [providerStore, regionStore]

  @computed get title(): string {
    return '可用区';
  }

  delete = object => {
    zoneStore
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
    return zoneStore.isLoading;
  }

  @computed get allItems() {
    return zoneStore.items;
  }

  @computed get selectedItem() {
    return zoneStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Zone) => this.renderTableContents(item));
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
  renderTableContents(item: Zone) {
    const userConfig = apiManager.userConfig;
    const provider = item.getNamespace();
    return {
      id: item.getId(),
      name: item.getName(),
      local_name: item.spec.local_name,
      provider: userConfig.providers[provider].localName + ' ' + `(${provider})`,
      region: userConfig.providers[provider].regions?.
        find(region => region.name = item.spec.region)?.
        localName + ' ' + (`(${item.spec.region})`),
      updatetime: item.getUpdateTime(),
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
                zoneApi,
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

apiManager.registerViews(zoneApi, { Details: Details });
