import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';

import st from './PlaceManage.less';
import Authorized, { validateC_ID } from '../../utils/Authorized4';
import UserBadge from '../Login/UserBadge';

let base = '/placemanage/',
  routes = ['personalcenter', 'doorplate', 'toponymyprove', 'guidepost', 'expressopinions'];

routes = [
  {
    c_id: 'pm.pc',
    c_name: '个人中心',
    route: 'personalcenter',
  },
  {
    c_id: 'pm.dpt',
    c_name: '门牌管理',
    route: 'doorplate',
  },
  {
    c_id: 'pm.tpp',
    c_name: '地名证明',
    route: 'toponymyprove',
  },
  {
    c_id: 'pm.gdp',
    c_name: '路牌管理',
    route: 'guidepost',
  },
  {
    c_id: 'pm.ba',
    c_name: '出具意见',
    route: 'expressopinions',
  },
];

class PlaceManage extends Component {
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
            render={ps => {
              return (
                <Authorized {...v}>
                  <Cmp {...ps} />
                </Authorized>
              );
            }}
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
      let { name, aicon, style } = routerData[path];
      let v = validateC_ID(i.c_id);
      if (v.pass) {
        cmpNavs.push(
          <Authorized {...v}>
            <Link to={path} className={pathname.indexOf(path.toLowerCase()) >= 0 ? 'active' : ''}>
              <span className={'iconfont ' + aicon} style={style} />
              {name}
            </Link>
          </Authorized>
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
          <div className={st.logo}>
            <Link to="/home" />
          </div>
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
