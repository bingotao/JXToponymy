import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import { Icon } from 'antd';
import st from './Doorplate.less';
import Authorized, { validateC_ID } from '../../utils/Authorized4';

let base = '/placemanage/doorplate/',
  routes = [
    {
      c_id: 'pm.dpt.qr',
      c_name: '门牌查询',
      route: 'doorplatesearch',
      isShow: true,
    },
    {
      c_id: 'pm.dpt.qr',
      c_name: '门牌查询新',
      route: 'doorplatesearchnew',
      isShow: true,
    },
    {
      c_id: 'pm.dpt.mdf',
      c_name: '门牌维护',
      route: 'doorplatemanage',
      passPrivilege: 'edit',
      isShow: false,
    },
    {
      c_id: 'pm.dpt.add',
      c_name: '门牌编制',
      route: 'doorplateadd',
      passPrivilege: 'edit',
      isShow: true,
    },
    {
      c_id: 'pm.dpt.alt',
      c_name: '门牌变更',
      route: 'doorplatechange',
      passPrivilege: 'edit',
      isShow: false,
    },
    {
      c_id: 'pm.dpt.rep',
      c_name: '门牌换补',
      route: 'doorplatereplace',
      passPrivilege: 'edit',
      isShow: false,
    },
    {
      c_id: 'pm.dpt.tpp',
      c_name: '地名证明',
      route: 'doorplateprove',
      passPrivilege: 'edit',
      isShow: false,
    },
    {
      c_id: 'pm.dpt.del',
      c_name: '门牌注销',
      route: 'doorplatedelete',
      passPrivilege: 'edit',
      isShow: false,
    },
    {
      c_id: 'pm.dpt.mk',
      c_name: '门牌制作',
      route: 'doorplatemaking',
      isShow: true,
    },
    {
      c_id: 'pm.dpt.st',
      c_name: '业务统计',
      route: 'doorplatestatistic',
      isShow: true,
    },
  ];

  
class Doorplate extends Component {
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
      cmpRoutes.push(<Redirect path={'/placemanage/doorplate'} to={cmpRoutes[0].props.path} />);
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
      <div className={st.Doorplate}>
        <div className={st.slider}>
          <div>
            <Icon type="appstore" />
            &ensp;门牌管理
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
