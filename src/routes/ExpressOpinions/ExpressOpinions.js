import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import { Icon } from 'antd';
import Authorized, { validateC_ID } from '../../utils/Authorized4';
import st from './ExpressOpinions.less';

let base = '/placemanage/expressopinions/',
  routes = ['basearch', 'bamanage'];

routes = [
  {
    c_id: 'pm.ba.qr',
    c_name: '备案查询',
    route: 'basearch',
  },
  {
    c_id: 'pm.ba.mdf',
    c_name: '地名备案',
    route: 'bamanage',
  },
];

class ExpressOpinions extends Component {
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
      console.log(path);
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
      <div className={st.ExpressOpinions}>
        <div className={st.slider}>
          <div>
            <Icon type="appstore" />&ensp;出具意见
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

export default ExpressOpinions;
