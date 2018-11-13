import React from 'react';
import { routerRedux, Route, Switch, Redirect } from 'dva/router';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { getRouterData } from './common/router';

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const PlaceManage = routerData['/placemanage'].component;
  const Login = routerData['/login'].component;
  const Home = routerData['/home'].component;
  const Map = routerData['/map'].component;
  return (
    <LocaleProvider locale={zhCN}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route routerData={routerData} path="/login" component={Login} />
          <Route routerData={routerData} path="/home" component={Home} />
          <Route routerData={routerData} path="/placemanage" component={PlaceManage} />
          <Redirect to="/login" />
          {/* <Route component={Map} /> */}
        </Switch>
      </ConnectedRouter>
    </LocaleProvider>
  );
}

export default RouterConfig;
