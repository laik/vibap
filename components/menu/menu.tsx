import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import PictureInPictureIcon from '@mui/icons-material/PictureInPicture';
import PushPinIcon from '@mui/icons-material/PushPin';
import {IconButton} from '@mui/material';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import MuiListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import {styled} from '@mui/material/styles';
import {alpha} from '@mui/system';
import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import Link from 'next/link';
import {NextRouter} from 'next/router';
import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from '../../redux/decorator';
import {expandThirdLayer, pinMenu} from '../../redux/menu/action';
import {withRouter} from '../withRouter';
import {icon} from './icon';

export type Menu = {
  name: string;
  link: string;
  title: string;
  icon?: React.ReactElement | string;
  parent?: boolean | undefined;
  children?: Menu[];
};

export type MenuList = Menu[];

export type FixedNode = {
  branchName: string;
  nodeName: string;
};

export type FixedNodeList = FixedNode[];

export const SidebarContent = styled('div')(({theme}) => ({
  minHeight: 0,
  flexGrow: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
}));

interface Leve1MenuProps {
  router?: NextRouter;
  // redux
  reduxMenus?: MenuList;
  expandMenu?: string[];
  fixedMenu?: any[];
  // action
  expandThirdLayer?: any;
  pinMenu?: any;
}

const mapStateToProps = state => {
  return {
    reduxMenus: state.user?.menus || [],
    thirdLayers: state.menu?.thirdLayers || [],
    lockedMenu: state.menu?.lockedMenu || [],
    fixedMenu: state.menu?.fixedMenu || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    expandThirdLayer: bindActionCreators(expandThirdLayer, dispatch),
    pinMenu: bindActionCreators(pinMenu, dispatch),
  };
};

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@observer
export default class Leve1Menu extends React.Component<Leve1MenuProps> {
  @observable levelevel_2Expand: boolean = true;
  @observable expandedMoreLeaf: string[] = [];
  @observable expandedPinLeaf: string[] = [];

  @observable fixedList: string[] = [];
  @observable fixedMenuNames: string[] = [];
  @observable focusNode: string = ''; // 聚焦node
  @computed get pathname(): string {
    return this.props.router.pathname;
  }

  // 首页
  index = () => {
    return (
      <Link href='/' passHref>
        <ListItemButton
          selected={this.pathname === '/'}
        >
          <ListItemIcon>
            <HomeIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary='首页' />
        </ListItemButton>
      </Link>
    );
  };

  // 🍃叶子
  level_three = (open, level_1_link, level_2) => {
    return (
      <Collapse in={open} timeout='auto' unmountOnExit>
        <List dense component='div' disablePadding>
          {level_2.children.map((l3, index) => (
            <Link
              href={level_1_link + level_2.link + l3.link}
              key={`l3-${index}`}
              passHref
            >
              <ListItemButton
                key={l3.name}
                sx={{pl: 6}}
                selected={this.pathname.includes(
                  level_1_link + level_2.link + l3.link
                )}
              >
                <ListItemText primary={l3?.title || ''} />
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Collapse>
    );
  };

  // 展开第三层 🍃叶子
  expand_level_tree = (e, l3, isPinMenu = false) => {
    e.stopPropagation();
    const name = l3.name;
    if (isPinMenu) {
      if (this.expandedPinLeaf.includes(name)) {
        const indexOf = this.expandedPinLeaf.indexOf(name);
        this.expandedPinLeaf.splice(indexOf, 1);
      } else {
        this.expandedPinLeaf.push(name);
      }
    } else {
      if (this.expandedMoreLeaf.includes(name)) {
        const indexOf = this.expandedMoreLeaf.indexOf(name);
        this.expandedMoreLeaf.splice(indexOf, 1);
      } else {
        this.expandedMoreLeaf.push(name);
      }
    }
  };

  // 固定 树枝 节点
  fixed = (e, level_2_name, level_1_link, level_2) => {
    e.stopPropagation();
    // pin menu in redux
    this.props.pinMenu({
      nodeName: level_2_name,
      branchLink: level_1_link,
      node: level_2,
    });
  };

  // 🌿树枝
  level_two = (
    level_1_link,
    level_2,
    index,
    isPinMenu = false,
    fixedMenus = []
  ) => {
    const has_level_three = level_2.children && level_2.children.length > 0;

    const l3open = isPinMenu
      ? this.expandedPinLeaf.includes(level_2.name)
      : this.expandedMoreLeaf.includes(level_2.name);

    const pined = fixedMenus.includes(level_2.name);
    const h = has_level_three ? '' : level_1_link + level_2.link;
    return (
      <React.Fragment key={index}>
        <Link href={h} passHref>
          <ListItemButton
            key={`level_two-${index}`}
            // onClick={this.props.onClose}
            onMouseEnter={() => (this.focusNode = level_2.name)}
            onMouseLeave={() => (this.focusNode = '')}
            selected={!has_level_three && this.pathname.includes(h)}
          >
            <ListItemIcon>
              {level_2?.icon ? (
                icon(level_2.icon)
              ) : (
                <PictureInPictureIcon fontSize='small' />
              )}
            </ListItemIcon>
            <ListItemText primary={level_2.title} />
            {/* 固定按钮🧷 */}
            {pined || this.focusNode == level_2.name ? (
              <IconButton
                size='small'
                color={pined ? 'primary' : 'default'}
                onClick={e =>
                  this.fixed(e, level_2.name, level_1_link, level_2)
                }
              >
                <PushPinIcon fontSize='small' />
              </IconButton>
            ) : (
              false
            )}
            {/* 展开按钮 */}
            {has_level_three ? (
              <IconButton
                size='small'
                onClick={e => this.expand_level_tree(e, level_2, isPinMenu)}
              >
                <ExpandMoreIcon fontSize='small' />
              </IconButton>
            ) : (
              <IconButton size='small'></IconButton>
            )}
          </ListItemButton>
        </Link>
        {has_level_three
          ? this.level_three(l3open, level_1_link, level_2)
          : false}
      </React.Fragment>
    );
  };

  pin = fixedItems => {
    const {fixedMenu} = this.props;
    return (
      <List
        dense
        subheader={
          <ListSubheader component='div' id='pin-subheader'>
            已固定
          </ListSubheader>
        }
        sx={{paddingBottom: 0}}
      >
        {fixedMenu.map((item, index) =>
          this.level_two(item.branchLink, item.node, index, true, fixedItems)
        )}
      </List>
    );
  };

  render() {
    const {fixedMenu} = this.props;
    const fixedMenuNames = fixedMenu.map(item => item.nodeName) || [];
    const menus = this.props.reduxMenus || [];
    return (
      <Grid container direction='column' sx={{height: '100%'}}>
        <Grid item xs='auto'>
          {this.pin(fixedMenuNames)}
          <Divider />
          <Button
            size='small'
            variant='text'
            endIcon={
              this.levelevel_2Expand ? (
                <ExpandLessIcon fontSize='small' />
              ) : (
                <ExpandMoreIcon fontSize='small' />
              )
            }
            onClick={() => {
              this.levelevel_2Expand = !this.levelevel_2Expand;
              this.expandedMoreLeaf = [];
            }}
            sx={{ml: 1, mt: 0.7, mb: 0.7}}
          >
            更多产品
          </Button>
          <Divider />
        </Grid>
        <Grid item xs sx={{overflowY: 'auto'}}>
          <Collapse in={this.levelevel_2Expand} timeout='auto' unmountOnExit>
            <List
              dense
              sx={{
                width: '100%',
                bgcolor: 'background.paper',
                position: 'relative',
                '& ul': {padding: 0},
              }}
              subheader={<li />}
            >
              {/* 主枝干 */}
              {menus.map((level_1, index) => {
                return level_1 &&
                  level_1.children &&
                  level_1.children.length > 0 ? (
                  <li key={`level_1-${index}`}>
                    <ul>
                      <ListSubheader>{level_1.title}</ListSubheader>
                      {/* 节点 */}
                      {level_1.children.map((level_2, index) =>
                        this.level_two(
                          level_1.link,
                          level_2,
                          index,
                          false,
                          fixedMenuNames
                        )
                      )}
                    </ul>
                  </li>
                ) : (
                  false
                );
              })}
            </List>
          </Collapse>
        </Grid>
      </Grid>
    );
  }
}

const ListItemButton = styled(MuiListItemButton)(({theme}) => {
  const color = theme.palette.primary[theme.palette.mode];
  return {
    '&:hover': {
      backgroundColor: alpha(color, theme.palette.action.hoverOpacity),
      color,
    },
    '&.Mui-selected': {
      backgroundColor: alpha(color, theme.palette.action.selectedOpacity),
      color,
    },
  };
});
