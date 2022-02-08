import AccountCircle from '@mui/icons-material/AccountCircle';
import MoreIcon from '@mui/icons-material/More';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import Router, { withRouter } from 'next/router';
import React from 'react';
//
import { connect} from '../../redux/decorator'
import {bindActionCreators} from 'redux';
import { objectWatchApi } from '../../client';
import {clearUserConfig, setUserConfig} from '../../redux/user/action';
import {SectionDesktop, SectionMobile} from './mobile-section';
import Notifications from '../template/notification';

interface UserMenuProps {
  user?: any;
  setUserConfig?: any;
  clearUserConfig?: any;
}

const mapStateToProps = state => {
  return state;
};

const mapDispatchToProps = dispatch => {
  return {
    setUserConfig: bindActionCreators(setUserConfig, dispatch),
    clearUserConfig: bindActionCreators(clearUserConfig, dispatch),
  };
};


@connect(mapStateToProps, mapDispatchToProps)
@observer
class UserMenu extends React.Component<UserMenuProps> {
  menuId = 'primary-search-account-menu';
  mobileMenuId = 'primary-search-account-menu-mobile';

  @observable anchorEl: HTMLElement = null;
  @observable mobileMoreAnchorEl: HTMLElement = null;

  isMenuOpen = () => Boolean(this.anchorEl);
  isMobileMenuOpen = () => Boolean(this.mobileMoreAnchorEl);

  handleMenuClose = () => {
    this.anchorEl = null;
    this.handleMobileMenuClose();
  };

  handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    this.mobileMoreAnchorEl = event.currentTarget;
  };

  handleMobileMenuClose = () => {
    this.mobileMoreAnchorEl = null;
  };

  handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    this.anchorEl = event.currentTarget;
  };

  handleLogout = () => {
    objectWatchApi.reset();
    this.props.clearUserConfig();
    Notifications.info('退出登录.....', 500);
    setTimeout(() => Router.push('/login'), 500);
  };

  renderMenu = () => {
    const {anchorEl, menuId} = this;
    return (
      <Menu
        anchorEl={anchorEl}
        id={menuId}
        keepMounted
        MenuListProps={{
          'aria-labelledby': 'account-button',
        }}
        open={this.isMenuOpen()}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.handleLogout}>退出登录</MenuItem>
      </Menu>
    );
  };

  renderMobileMenu = () => {
    const {mobileMenuId, mobileMoreAnchorEl} = this;
    return (
      <Menu
        sx={{overflow: 'auto', height: '100vh'}}
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
        id={mobileMenuId}
        keepMounted
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        open={this.isMobileMenuOpen()}
        onClose={this.handleMobileMenuClose}
      >
        <MenuItem onClick={this.handleProfileMenuOpen}>
          <IconButton
            aria-label='account of current user'
            aria-controls='primary-search-account-menu'
            aria-haspopup='true'
            color='inherit'
          >
            <AccountCircle />
          </IconButton>
          <p>Profile</p>
        </MenuItem>
      </Menu>
    );
  };

  avatar = () => {
    const name = this.props.user['userName'] || '*';
    return (
      <Avatar sx={{width: 30, height: 30}} variant='rounded'>
        {name[0].toUpperCase()}
      </Avatar>
    );
  };

  render() {
    const {
      menuId,
      mobileMenuId,
      handleProfileMenuOpen,
      handleMobileMenuOpen,
      renderMobileMenu,
      renderMenu,
    } = this;

    return (
      <>
        <SectionDesktop>
          <IconButton
            id='account-button'
            edge='end'
            aria-controls={menuId}
            aria-haspopup='true'
            onClick={handleProfileMenuOpen}
            color='inherit'
          >
            {this.avatar()}
          </IconButton>
        </SectionDesktop>
        <SectionMobile>
          <IconButton
            aria-label='show more'
            aria-controls={mobileMenuId}
            aria-haspopup='true'
            onClick={handleMobileMenuOpen}
            color='inherit'
          >
            <MoreIcon />
          </IconButton>
        </SectionMobile>
        {renderMobileMenu()}
        {renderMenu()}
      </>
    );
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);
