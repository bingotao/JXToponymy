import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import { Icon } from 'antd';
import st from './PersonalCenter.less';
import Authorized, { validateC_ID } from '../../utils/Authorized4';

let base = '/placemanage/personalcenter/',
  // routes = ['home', 'todo', 'done'];

  routes = [
    {
      c_id: 'pm.pc.hm',
      c_name: '首页',
      route: 'home',
      isShow: false,
    },
    {
      c_id: 'pm.pc.td',
      c_name: '待办业务',
      route: 'todo',
      isShow: true,
    },
    {
      c_id: 'pm.pc.dn',
      c_name: '已办业务',
      route: 'done',
      isShow: true,
    },
  ];

class PersonalCenter extends Component {
  getRoutes() {
    let { routerData } = this.props;
    let cmpRoutes = [];
    for (let i of routes) {
      let path = base + i.route;
      let Cmp = routerData[path].component;
      let v = validateC_ID(i.c_id);
      if (v.pass)
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
    if (cmpRoutes.length)
      cmpRoutes.push(<Redirect path={'/placemanage'} to={cmpRoutes[0].props.path} />);
    return cmpRoutes;
  }

  getNavs() {
    let { pathname } = this.props.location;
    let { routerData } = this.props;
    let cmpNavs = [];
    for (let i of routes) {
      let path = base + i.route,
        { name, icon } = routerData[path];
      let v = validateC_ID(i.c_id);
      if (v.pass && i.isShow) {
        cmpNavs.push(
          <Authorized {...v}>
            <div className={pathname.indexOf(path.toLowerCase()) >= 0 ? 'active' : ''}>
              <Link to={path}>
                <Icon type={icon} />
                &ensp;{name}
              </Link>
            </div>
          </Authorized>
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
      <div className={st.PersonalCenter}>
        <div className={st.slider}>
          <div>
            <Icon type="appstore" />
            &ensp;个人中心
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

export default PersonalCenter;
