import React, { Component } from 'react';
import { Link, Route, Switch, Redirect } from 'dva/router';
import UserBadge from '../Login/UserBadge';
import st from './SystemMaintain.less';

let base = '/systemmaintain/',
    defaultPage = 'dicmanage',
    routes = ['dicmanage', 'userrolemanage'/*, 'logmanage'*/];
let dfPage = base + defaultPage;

class SystemMaintain extends Component {
    getRoutes() {
        let { routerData } = this.props;
        let cmpRoutes = routes.map(i => {
            let path = base + i;
            let cmp = routerData[path].component;
            return <Route routerData={routerData} path={path} component={cmp} />;
        });

        cmpRoutes.push(<Redirect path="/systemmaintain" to={dfPage} />);
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
            .on('click', function () {
                let ac = 'active';
                $(this)
                    .addClass(ac)
                    .siblings()
                    .removeClass(ac);
            });
    }

    render() {
        return (
            <div className={st.SystemMaintain}>
                <div className={st.header}>
                    <div className={st.logo} />
                    <div className={st.title}>嘉兴市区划地名业务平台</div>
                    <div className={st.userbadge}>
            <UserBadge />
          </div>
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

export default SystemMaintain;
