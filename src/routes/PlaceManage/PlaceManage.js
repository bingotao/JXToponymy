import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';

import st from './PlaceManage.less';

let base = '/placemanage/',
  defaultPage = 'doorplate',
  routes = ['doorplate', 'toponymyprove', 'guidepost'];
let dfPage = base + defaultPage;

class PlaceManage extends Component {
  getRoutes() {
    let { routerData } = this.props;
    let cmpRoutes = routes.map(i => {
      let path = base + i;
      let cmp = routerData[path].component;
      return <Route routerData={routerData} path={path} component={cmp} />;
    });

    cmpRoutes.push(<Redirect path="/placemanage" to={dfPage} />);
    return cmpRoutes;
  }

  getNavs() {
    let { pathname } = this.props.location;
    let { routerData } = this.props;
    let cmpNavs = routes.map(i => {
      let path = base + i;
      let { name, aicon, style } = routerData[path];
      ('');
      return (
        <Link to={path} className={pathname.indexOf(path.toLowerCase()) >= 0 ? 'active' : ''}>
          <span className={'iconfont ' + aicon} style={style} />
          {name}
        </Link>
      );
    });

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
    let { routerData } = this.props;
    return (
      <div className={st.PlaceManage}>
        <div className={st.header}>
          <div className={st.logo} />
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
