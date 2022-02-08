import {computed} from 'mobx';
import {observer} from 'mobx-react';
import { apiManager } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import { Panel, PanelProps } from '../../template';
import {
  CloudEvent,
  cloudEventStore,
} from './cloudevent.store';

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
  },
  {
    name: 'source',
    header: '资源',
    defaultFlex: 1,
  },
  {
    name: 'workspace',
    header: '工作空间',
    defaultFlex: 1,
  },
  {
    name: 'name',
    header: '资源名',
    defaultFlex: 1,
  },
  {
    name: 'action',
    header: '动作',
    defaultFlex: 1,
  },
  {
    name: 'operator',
    header: '操作者',
    defaultFlex: 1,
  },
  {
    name: 'status',
    header: '操作结果',
    defaultFlex: 1,
  },
];

@observer
@storeables(apiManager.getStores(['cloudevent']))
export default class EventDataGrid extends Panel<PanelProps> {

  showExport = true;
  moreMenuButton = false;

  // table
  @computed get title(): string {
    return '事件';
  }

  @computed get isLoading(): boolean {
    return cloudEventStore.isLoading;
  }

  @computed get allItems() {
    return cloudEventStore.items;
  }

  @computed get selectedItem() {
    return cloudEventStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: CloudEvent) =>
      this.renderTableContents(item)
    );
  }

  renderTableContents(item: CloudEvent) {
    return {
      id: item.getId(),
      source: item.spec.source,
      workspace: item.spec.source_workspace,
      name: item.spec.name,
      action: item.spec.action,
      operator: item.spec.operator,
      status: item.spec.operator_status,
      IObject: item,
    };
  }
}
