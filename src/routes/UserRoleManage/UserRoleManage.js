import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import { Icon } from 'antd';
import st from './UserRoleManage.less';

let base = '/systemmaintain/userrolemanage/',
  defaultPage = 'usermanage',
  routes = ['usermanage', 'rolemanage'];
let dfPage = base + defaultPage;

class UserRoleManage extends Component {
  getRoutes() {
    let { routerData } = this.props;
    let cmpRoutes = routes.map(i => {
      let path = base + i,
        { component } = routerData[path];
      return <Route path={path} component={component} routerData={routerData} />;
    });

    // 字典管理默认页
    cmpRoutes.push(<Redirect path="/systemmaintain/userrolemanage" to={dfPage} />);
    return cmpRoutes;
  }

  getNavs() {
    let { pathname } = this.props.location;
    let { routerData } = this.props;
    let cmpNavs = routes.map(i => {
      let path = base + i,
        { name, icon } = routerData[path];
      return (
        <div className={pathname.indexOf(path.toLowerCase()) >= 0 ? 'active' : ''}>
          <Link to={path}>
            <Icon type={icon} />&ensp;{name}
          </Link>
        </div>
      );
    });
    return cmpNavs;
  }

  componentDidMount() {
    $(this.navs)
      .find('div')
      .on('click', function () {
        let ac = 'active';
        $(this)
          .addClass(ac)
          .siblings()
          .removeClass(ac);
      });
  }

  render() {
    return (
      <div className={st.UserRoleManage}>
        <div className={st.slider}>
          <div>
            <Icon type="appstore" />&ensp;用户权限管理
          </div>
          <div ref={e => (this.navs = e)}>{this.getNavs()}</div>
        </div>
        <div className={st.content}>
          <Switch>{this.getRoutes()}</Switch>
        </div>
      </div>
    );
  }
}

export default UserRoleManage;