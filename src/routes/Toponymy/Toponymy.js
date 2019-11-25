import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import { Icon } from 'antd';
import st from './Toponymy.less';
import Authorized, { validateC_ID } from '../../utils/Authorized4';

let base = '/placemanage/toponymy/',
  routes = [
    {
      c_id: 'pm.tpm.se',
      c_name: '地名查询',
      route: 'toponymysearch',
      isShow: true,
    },
    {
      c_id: 'pm.tpm.ac',
      c_name: '地名受理',
      route: 'toponymyaccept',
      isShow: true,
    },
    {
      c_id: 'pm.tpm.pa',
      c_name: '地名预命名',
      route: 'toponymypreapproval',
      isShow: false,
    },
    {
      c_id: 'pm.tpm.ap',
      c_name: '地名命名',
      route: 'toponymyapproval',
      isShow: false,
    },
    {
      c_id: 'pm.tpm.re',
      c_name: '地名更名',
      route: 'toponymyrename',
      isShow: false,
    },
    {
      c_id: 'pm.tpm.rp',
      c_name: '地名换补',
      route: 'toponymyreplace',
      isShow: false,
    },
    {
      c_id: 'pm.tpm.ce',
      c_name: '地名销名',
      route: 'toponymycancel',
      isShow: false,
    },
    {
      c_id: 'pm.tpm.st',
      c_name: '地名统计',
      route: 'toponymystatistic',
      isShow: true,
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
            component={ps => {
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
        { name, icon, aicon, style } = routerData[path];
      let v = validateC_ID(i.c_id);
      if (v.pass & i.isShow) {
        cmpNavs.push(
          <Authorized {...v}>
            <div className={pathname.indexOf(path.toLowerCase()) >= 0 ? 'active' : ''}>
              <Link to={path}>
                {aicon ? (
                  <span className={'iconfont ' + aicon} style={style} />
                ) : (
                  <Icon type={icon} style={style} />
                )}
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
            <Icon type="appstore" />
            &ensp;地名管理
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
