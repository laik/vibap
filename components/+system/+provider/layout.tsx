import {computed} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import {DialAction, Panel, PanelProps} from '../../template/panel';
import {withRouter} from '../../withRouter';
import {AddDialog} from './add-dialog';
import Details from './details';
import {Provider, providerApi, providerStore} from './store';

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    editable: true,
  },
  {
    name: 'name',
    header: '名称',
    defaultFlex: 1,
    editable: true,
  },
  {
    name: 'localName',
    header: '本地名称',
    defaultFlex: 1,
    editable: true,
  },
  {
    name: 'thirdParty',
    header: '是否第三方',
    defaultFlex: 1,
    editable: true,
  },
  {
    name: 'updatetime',
    header: '更新时间',
    defaultFlex: 1,
    editable: true,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['provider']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '本地名称',
      field: 'localName',
      type: 'text',
    },
    {
      label: '是否第三方',
      field: 'thirdParty',
      type: 'radio', // TODO: 改为下拉列表
      options: [
        {label: 'Y', value: 'Y'},
        {label: 'N', value: 'N'},
      ],
    },
  ];

  @computed get title(): string {
    return '供应商';
  }

  delete = object => {
    providerStore
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
    return providerStore.isLoading;
  }

  @computed get allItems() {
    return providerStore.items;
  }

  @computed get selectedItem() {
    return providerStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Provider) =>
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

  renderTableContents(item: Provider) {
    return {
      id: item.getId(),
      name: item.getName(),
      localName: item.spec.localName,
      thirdParty: item.spec.thirdParty ? 'Y' : 'N',
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
                providerApi,
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

apiManager.registerViews(providerApi, {Details: Details});
