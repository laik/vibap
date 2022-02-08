import { computed, observable } from 'mobx';
import { redux_userconfig } from './redux-store';
import { classbind } from './utils/autobind';

export interface IUserAllowedProvider {
  name: string;
  localName: string;
  thirdParty: boolean;
  regions: {
    name: string;
    localName: string;
    azs: [
      {
        name: string;
        localName: string;
      }
    ];
  }[];
  azClusters: {
    az: string;
    clusters: string[];
  }[];
  clusterNamespaces: {
    cluster: string;
    namespaces: string[];
  }[];
}

export interface IClusterNs {
  cluster?: string;
  ns?: string[];
}

export interface IUserConfig {
  userName: string;
  token: string;
  allowWorkspaces: string[];
  providers: { [provider: string]: IUserAllowedProvider };
}

@classbind()
export class Menu {
  name: string;
  link: string;
  title: string;
  icon: string;
  children: Menu[];
  getAll(): string {
    return JSON.stringify(this);
  }
}

@classbind()
export class UserConfig {
  userName: string;
  token: string;
  defaultWorkspace: string;
  @observable allowWorkspaces: string[];
  @observable roleType: number;
  providers: { [provider: string]: IUserAllowedProvider };
  productMenu: string[];
  actionMenu: { [product: string]: string[] };
  permission: { [product: string]: { [action: string]: string[] | { [action2: string]: string[] } } }; // 已授权的资源;
  menus: Menu[];
  tenant: string;
  isTenantOwner: boolean;
  ownerBiz: string[];
  bizGroups: string[];
  roles: string[];

  constructor(data: any) {
    Object.assign(this, data);
  }

  @computed get allowWorkspace() {
    return this.allowWorkspaces.filter(ws => ws !== "");
  }

  static get(): UserConfig {
    return new UserConfig(redux_userconfig());
  }

  static getProviders(u: UserConfig): Map<string, string> {
    let result = new Map<string, string>();
    u?.providers && Object.entries(u.providers).
      forEach(([_, uap]) =>
        result.set(uap.name, uap.localName)
      );
    return result;
  }

  static getRegions(u: UserConfig, provider: string): Map<string, string> {
    let result = new Map<string, string>();
    if (!u?.providers) return result;

    Object.entries(u.providers).forEach(([_, uap]) => {
      if (uap.name == provider) {
        uap.regions.forEach(r => {
          result.set(r.localName, r.name)
        });
      }
    })
    return result;
  }

  // fix
  static getZones(u: UserConfig, provider: string, region: string): Map<string, string> {
    let result = new Map<string, string>();
    if (!u?.providers) return result;
    Object.entries(u.providers).
      filter(([_, uap]) => uap.name === provider).
      forEach(([_, uap]) => {
        uap.regions.
          filter(r => r.name === region).
          forEach(r => {
            r.azs.forEach(z => {
              result.set(z.name, z.localName)
            })
          });
      })
    return result;
  }


  @computed get isAdmin(): boolean {
    return this.roleType == 3;
  }

  @computed get ws() {
    return this.defaultWorkspace;
  }

  static getUserType(type: number): Map<number, string> {
    let result = new Map();
    switch (type) {
      case 3:
        result.set(4, "租户");
        result.set(3, "管理员");
        break;
      default:
        console.log("illegal data or op");

    }
    return result;
  }

  getClustersNs(): IClusterNs[] {
    if (!this.providers) {
      return [];
    }
    let iclusterNs: IClusterNs[];
    Object.entries(this.providers).map(p =>
      p[1].clusterNamespaces?.map(cn =>
        iclusterNs.push({ cluster: cn.cluster, ns: cn.namespaces })
      )
    );
    return iclusterNs;
  }

  static getAllWs(userConfig: UserConfig): string[] {
    if (!userConfig?.allowWorkspaces) {
      return [];
    }
    return userConfig.allowWorkspaces.filter(ws => ws !== "ALL");
  }


  static getTenant(userConfig: UserConfig): string {
    return userConfig.tenant
  }
}
