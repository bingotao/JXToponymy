import React, { Component } from 'react';
import { routerRedux, Route, Switch, Redirect } from 'dva/router';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { getRouterData } from './common/router';
//import Authorized from './utils/Authorized2';
//import Authorized3 from './utils/Authorized3';
import Authorized from './utils/Authorized4';

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const PlaceManage = routerData['/placemanage'].component;
  const SystemMaintain = routerData['/systemmaintain'].component;
  const Login = routerData['/login'].component;
  const Home = routerData['/home'].component;
  const Services = routerData['/services'].component;
  const DataAnalysis = routerData['/dataanalysis'].component;
  const Notfound = routerData['/exception/404'].component;
  const Map = routerData['/map2'].component;
  const Test = routerData['/test'].component;

  return (
    <LocaleProvider locale={zhCN}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/login" component={Login} />
          <Route
            path="/home"
            render={ps => {
              return (
                <Authorized c_id="hm" noMatch={<NoMatch />}>
                  <Home {...ps} />
                </Authorized>
              );
            }}
          />
          <Route
            path="/placemanage"
            render={ps => {
              return (
                <Authorized c_id="pm" noMatch={<NoMatch />}>
                  <PlaceManage {...ps} />
                </Authorized>
              );
            }}
          />
          <Route
            path="/services"
            render={ps => {
              return (
                <Authorized c_id="svs" noMatch={<NoMatch />}>
                  <Map {...ps} />
                </Authorized>
              );
            }}
          />
          <Route
            path="/dataanalysis"
            render={ps => {
              return (
                <Authorized c_id="das" noMatch={<NoMatch />}>
                  <DataAnalysis {...ps} />
                </Authorized>
              );
            }}
          />
          <Route
            path="/systemmaintain"
            render={ps => {
              return (
                <Authorized c_id="ssm" noMatch={<NoMatch />}>
                  <SystemMaintain {...ps} />
                </Authorized>
              );
            }}
          />
          <Route
            routerData={routerData}
            path="/test"
            render={ps => {
              return <Test {...ps} />;
            }}
          />
          <Redirect exact from="/" to="/login" />
          <Route component={Notfound} />
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
