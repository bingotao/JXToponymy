import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import { Icon } from 'antd';
import Authorized, { validateC_ID } from '../../utils/Authorized4';
import st from './Guidepost.less';

let base = '/placemanage/guidepost/',
  routes = ['gpsearch', 'gpmanage', 'gpstatistic'];

routes = [
  {
    c_id: 'pm.gdp.qr',
    c_name: '路牌查询',
    route: 'gpsearch',
  },
  {
    c_id: 'pm.gdp.mdf',
    c_name: '路牌追加',
    route: 'gpmanage',
  },
  {
    c_id: 'pm.gdp.st',
    c_name: '路牌统计',
    route: 'gpstatistic',
  },
];

class Guidepost extends Component {
  getRoutes() {
    let { routerData } = this.props;
    let cmpRoutes = [];
    for (let i of routes) {
      let path = base + i.route;
      let Cmp = routerData[path].component;
      let v = validateC_ID(i.c_id);
      if (v.pass) {
        cmpRoutes.push(
          <Route
            routerData={routerData}
            path={path}
            render={ps => (
              <Authorized {...v}>
                <Cmp {...ps} />
              </Authorized>
            )}
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
    let { routerData } = this.props;
    let cmpNavs = [];
    for (let i of routes) {
      let path = base + i.route;
      let { name, icon } = routerData[path];
      let v = validateC_ID(i.c_id);
      if (v.pass) {
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
