import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import { Icon } from 'antd';
import st from './Doorplate.less';
import Authorized from '../../utils/Authorized2';

let base = '/placemanage/doorplate/',
  routes = ['doorplatesearch', 'doorplatemanage', 'doorplatemaking', 'doorplatestatistic'];

routes = [
  {
    c_id: 'pm_dpt_qr',
    c_name: '门牌查询',
    route: 'doorplatesearch',
  },
  {
    c_id: 'pm_dpt_mdf',
    c_name: '门牌维护',
    route: 'doorplatemanage',
    passPrivilege: 'edit',
  },
  {
    c_id: 'pm_dpt_mk',
    c_name: '门牌制作',
    route: 'doorplatemaking',
  },
  {
    c_id: 'pm_dpt_st',
    c_name: '业务统计',
    route: 'doorplatestatistic',
  },
];

class Doorplate extends Component {
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
            render={ps => {
              return <Cmp {...ps} privilege={Authorized.getPrivilege(i.c_id) || privilege} />;
            }}
            // component={cmp}
          />
        );
      }
    }
    if (cmpRoutes.length)
      cmpRoutes.push(<Redirect path={'/placemanage/doorplate'} to={cmpRoutes[0].props.path} />);
    return cmpRoutes;
  }

  getNavs() {
    let { pathname } = this.props.location;
    let { routerData, privilege } = this.props;
    let cmpNavs = [];
    for (let i of routes) {
      if (Authorized.validate(i.c_id, privilege, i.passPrivilege)) {
        let path = base + i.route,
          { name, icon } = routerData[path];
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
      <div className={st.Doorplate}>
        <div className={st.slider}>
          <div>
            <Icon type="appstore" />&ensp;门牌管理
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

export default Doorplate;
