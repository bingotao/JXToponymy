import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';

import st from './PlaceManage.less';
import Authorized from '../../utils/Authorized2';
import UserBadge from '../Login/UserBadge';

let base = '/placemanage/',
  routes = ['doorplate', 'toponymyprove', 'guidepost'];

routes = [
  {
    c_id: 'pm_dpt',
    c_name: '门牌管理',
    route: 'doorplate',
  },
  {
    c_id: 'pm_tpp',
    c_name: '地名证明',
    route: 'toponymyprove',
  },
  {
    c_id: 'pm_gdp',
    c_name: '路牌管理',
    route: 'guidepost',
  },
];

class PlaceManage extends Component {
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
      let { name, aicon, style } = routerData[path];
      if (Authorized.validate(i.c_id, privilege, i.passPrivilege)) {
        cmpNavs.push(
          <Link to={path} className={pathname.indexOf(path.toLowerCase()) >= 0 ? 'active' : ''}>
            <span className={'iconfont ' + aicon} style={style} />
            {name}
          </Link>
        );
      }
    }
    return cmpNavs;
  }

  componentDidMount() {
    $(this.slider)
      .find('a')
      .on('click', function() {
        let ac = 'active';
        $(this)
          .addClass(ac)
          .siblings()
          .removeClass(ac);
      });
  }

  render() {
    // let { routerData } = this.props;
    return (
      <div className={st.PlaceManage}>
        <div className={st.header}>
          <div className={st.logo} />
          <div className={st.title}>嘉兴市区划地名业务平台</div>
          <div className={st.userbadge}>
            <UserBadge />
          </div>
        </div>
        <div className={st.body}>
          <div ref={e => (this.slider = e)} className={st.slider}>
            {this.getNavs()}
          </div>
          <div className={st.content}>
            <Switch>{this.getRoutes()}</Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default PlaceManage;
