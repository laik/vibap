import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import { DialAction, Panel, PanelProps } from '../../template';
import Notifications from '../../template/notification';
import { withRouter } from '../../withRouter';
import DeploymentDetails from './deployments.details';
import { Deployment, deploymentApi, deploymentStore } from './deployments.store';

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
    name: 'namespace',
    header: '命名空间',
    defaultFlex: 1,
  },
  {
    name: 'pods',
    header: 'pods',
    defaultFlex: 1,
  },
  {
    name: 'replicas',
    header: 'replicas',
    defaultFlex: 1,
  },
  {
    name: 'age',
    header: 'age',
    defaultFlex: 1,
  },
  {
    name: 'conditions',
    header: 'conditions',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['deployments']))
export default class Layout extends Panel<PanelProps> {


  @computed get title(): string {
    return 'Deployments';
  }

  delete = object => {
    deploymentStore
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
    return deploymentStore.isLoading;
  }

  @computed get allItems() {
    return deploymentStore.items;
  }

  @computed get selectedItem() {
    return deploymentStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Deployment) =>
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

  renderTableContents(item: Deployment) {
    const pods = `${item.getReadyReplicas()}/${item.getReplicas()}`;
    const conditions = item.getConditions(true);

    let conditionsStr = '';
    conditions.map(item => {
      conditionsStr = `${conditionsStr} ${item.type}`;
    });

    return {
      id: item.getId(),
      name: item.getName(),
      namespace: item.getNs(),
      area: item.metadata.area,
      replicas: item.getReplicas(),
      pods: pods,
      age: item.getAge(),
      conditions: conditionsStr,
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
                deploymentApi,
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

apiManager.registerViews(deploymentApi, {Details: DeploymentDetails});
