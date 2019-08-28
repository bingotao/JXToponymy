import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import { Icon } from 'antd';
import st from './Toponymy.less';
import Authorized, { validateC_ID } from '../../utils/Authorized4';

let base = '/placemanage/toponymy/',
  routes = [
    'toponymyaccept',
    'toponymycheck',
    'toponymyapproval',
    'toponymyrename',
    'toponymycancel',
  ];

routes = [
  {
    c_id: 'pm.tpm.at',
    c_name: '地名受理',
    route: 'toponymyaccept',
  },
  {
    c_id: 'pm.tpm.ck',
    c_name: '地名审核',
    route: 'toponymycheck',
  },
  {
    c_id: 'pm.tpm.al',
    c_name: '地名审批',
    route: 'toponymyapproval',
  },
  {
    c_id: 'pm.tpm.re',
    c_name: '地名更名',
    route: 'toponymyrename',
  },
  {
    c_id: 'pm.tpm.ce',
    c_name: '地名销名',
    route: 'toponymycancel',
  },
];

class Toponymy extends Component {
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
      cmpRoutes.push(<Redirect path={'/placemanage/toponymy'} to={cmpRoutes[0].props.path} />);
    return cmpRoutes;
  }

  getNavs() {
    let { pathname } = this.props.location;
    let { routerData } = this.props;
    let cmpNavs = [];
    for (let i of routes) {
      let path = base + i.route,
        { name, icon, aicon,style } = routerData[path];
      let v = validateC_ID(i.c_id);
      if (v.pass) {
        cmpNavs.push(
          <Authorized {...v}>
            <div className={pathname.indexOf(path.toLowerCase()) >= 0 ? 'active' : ''}>
              <Link to={path}>
              {
                aicon? (<span className={'iconfont ' + aicon} style={style} />):(<Icon type={icon} />)
              }
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
      <div className={st.Toponymy}>
        <div className={st.slider}>
          <div>
            <Icon type="appstore" />&ensp;地名管理
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

export default Toponymy;
