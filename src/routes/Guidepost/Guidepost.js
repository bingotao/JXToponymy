import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import { Icon } from 'antd';
import Authorized from '../../utils/Authorized2';
import st from './Guidepost.less';

let base = '/placemanage/guidepost/',
  routes = ['gpsearch', 'gpmanage', 'gpstatistic'];

routes = [
  {
    c_id: 'pm_gdp_qr',
    c_name: '路牌查询',
    route: 'gpsearch',
  },
  {
    c_id: 'pm_gdp_mdf',
    c_name: '路牌追加',
    route: 'gpmanage',
    passPrivilege: 'edit',
  },
  {
    c_id: 'pm_gdp_st',
    c_name: '路牌统计',
    route: 'gpstatistic',
  },
];

class Guidepost extends Component {
  getRoutes() {
    let { routerData, privilege } = this.props;
    let cmpRoutes = [];
    for (let i of routes) {
      let path = base + i.route;
      let Cmp = routerData[path].component;
      if (Authorized.validate(i.c_id, privilege, i.passPrivilege)) {
        cmpRoutes.push(
          <Route
            routerData={routerData}
            path={path}
            render={ps => <Cmp {...ps} privilege={Authorized.getPrivilege(i.c_id) || privilege} />}
            // component={cmp}
          />
        );
      }
    }
    if (cmpRoutes.length)
      cmpRoutes.push(<Redirect path={'/placemanage'} to={cmpRoutes[0].props.path} />);
    return cmpRoutes;
  }

  getNavs() {
    let { pathname } = this.props.location;
    let { routerData, privilege } = this.props;
    let cmpNavs = [];
    for (let i of routes) {
      let path = base + i.route;
      let { name, icon } = routerData[path];
      if (Authorized.validate(i.c_id, privilege, i.passPrivilege)) {
        cmpNavs.push(
          <div className={pathname.indexOf(path.toLowerCase()) >= 0 ? 'active' : ''}>
            <Link to={path}>
              <Icon type={icon} />&ensp;{name}
            </Link>
          </div>
        );
      }
    }
    return cmpNavs;
  }

  componentDidMount() {
    $(this.navs)
      .find('div')
      .on('click', function() {
        let ac = 'active';
        $(this)
          .addClass(ac)
          .siblings()
          .removeClass(ac);
      });
  }

  render() {
    return (
      <div className={st.Guidepost}>
        <div className={st.slider}>
          <div>
            <Icon type="appstore" />&ensp;路牌管理
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

export default Guidepost;
