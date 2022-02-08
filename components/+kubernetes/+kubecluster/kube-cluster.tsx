import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import {DialAction, Panel, PanelProps} from '../../template';
import Notifications from '../../template/notification';
import {withRouter} from '../../withRouter';
import KubeClusterDetails from './kube-cluster.details';
import {
  KubeCluster,
  kubeClusterApi,
  kubeClusterStore,
} from './kube-cluster.store';

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
];

@withRouter
@observer
@storeables(apiManager.getStores(['cluster']))
export default class Layout extends Panel<PanelProps> {
  @computed get title(): string {
    return 'Kubernetes 集群配置';
  }

  delete = object => {
    kubeClusterStore
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
    return kubeClusterStore.isLoading;
  }

  @computed get allItems() {
    return kubeClusterStore.items;
  }

  @computed get selectedItem() {
    return kubeClusterStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: KubeCluster) =>
      this.renderTableContents(item)
    );
  }

  @computed get dial(): DialAction[] {
    var items = [].concat(
      this.selected_list.length
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

  renderTableContents(item: KubeCluster) {
    return {
      id: item.getId(),
      name: item.getName(),
      area: item.metadata.area,
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
                kubeClusterApi,
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
}

apiManager.registerViews(kubeClusterApi, {Details: KubeClusterDetails});
