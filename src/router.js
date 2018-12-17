import React, { Component } from 'react';
import { routerRedux, Route, Switch, Redirect } from 'dva/router';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized2';
import Authorized3 from './utils/Authorized3';

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const PlaceManage = routerData['/placemanage'].component;
  const SystemMaintain = routerData['/systemmaintain'].component;
  const Login = routerData['/login'].component;
  const Home = routerData['/home'].component;
  const Test = routerData['/test'].component;
  // const Map = routerData['/map2'].component;
  return (
    <LocaleProvider locale={zhCN}>
      <ConnectedRouter history={history}>
        <Switch>
          {/* <Route routerData={routerData} path="/login" component={Login} /> */}
          {/* <Route
            routerData={routerData}
            path="/home"
            render={ps => {
              return (
                <Authorized c_id="hm" passPrivilege="view,edit" noMatch={<NoMatch />}>
                  <Home {...ps} />
                </Authorized>
              );
            }}
          />
          <Route
            routerData={routerData}
            path="/placemanage"
            render={ps => {
              return (
                <Authorized c_id="pm" passPrivilege="view,edit" noMatch={<NoMatch />}>
                  <PlaceManage {...ps} />
                </Authorized>
              );
            }}
          /> */}
          <Route
            routerData={routerData}
            path="/test"
            render={ps => {
              return (
                <Authorized3 c_id="t">
                  <Test {...ps} />
                </Authorized3>
              );
            }}
          />
          {/* <Route routerData={routerData} path="/systemmaintain" component={SystemMaintain} /> */}
          {/* <Redirect to="/login" /> */}
          {/* <Route component={Map} /> */}
        </Switch>
      </ConnectedRouter>
    </LocaleProvider>
  );
}

class NoMatch extends Component {
  render() {
    return <Redirect to="/login" />;
  }
}

export default RouterConfig;
