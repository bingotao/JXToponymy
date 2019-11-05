import React, { createElement } from 'react';
import { Spin } from 'antd';
import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // register models
  models.forEach(model => {
    if (modelNotExisted(app, model)) {
      // eslint-disable-next-line
      app.model(require(`../models/${model}`).default);
    }
  });

  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return Loadable({
    loader: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
    loading: () => {
      return <Spin size="large" className="global-spin" />;
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/map': {
      component: dynamicWrapper(app, [], () => import('../components/Maps/LocateMap2')),
    },
    '/map2': {
      component: dynamicWrapper(app, [], () => import('../components/Maps/LocateMapTmp')),
    },
    '/test': {
      component: dynamicWrapper(app, [], () => import('../routes/Test/Test')),
    },
    '/login': {
      component: dynamicWrapper(app, [], () => import('../routes/Login/Login')),
    },
    '/home': {
      component: dynamicWrapper(app, [], () => import('../routes/Home/Home')),
    },

    /* 地名管理 */
    '/placemanage': {
      component: dynamicWrapper(app, [], () => import('../routes/PlaceManage/PlaceManage')),
    },

    /* 地名管理个人中心 */
    '/placemanage/personalcenter': {
      name: '个人中心',
      aicon: 'icon-shouye',
      style: { fontSize: '26px' },
      component: dynamicWrapper(app, [], () => import('../routes/PersonalCenter/PersonalCenter')),
    },
    '/placemanage/personalcenter/home': {
      name: '个人首页',
      icon: 'home',
      style: { fontSize: '26px' },
      component: dynamicWrapper(app, [], () => import('../routes/PersonalCenter/Home/Home')),
    },
    '/placemanage/personalcenter/todo': {
      name: '待办事项',
      icon: 'form',
      style: { fontSize: '26px' },
      component: dynamicWrapper(app, [], () => import('../routes/PersonalCenter/ToDo/ToDo')),
    },
    '/placemanage/personalcenter/done': {
      name: '已办事项',
      icon: 'check-circle',
      style: { fontSize: '26px' },
      component: dynamicWrapper(app, [], () => import('../routes/PersonalCenter/Done/Done')),
    },

    /* 地名管理首页 */
    '/placemanage/home': {
      name: '首页',
      aicon: 'icon-shouye',
      style: { fontSize: '26px' },
      component: dynamicWrapper(app, [], () => import('../routes/Home/Home')),
    },

    /* 门牌管理 */
    '/placemanage/doorplate': {
      name: '门牌管理',
      aicon: 'icon-paizhao',
      style: { fontSize: '18px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () => import('../routes/Doorplate/Doorplate')),
    },
    '/placemanage/doorplate/doorplatesearch': {
      name: '门牌查询',
      icon: 'search',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateSearch/DoorplateSearch')
      ),
    },
    '/placemanage/doorplate/doorplatesearchnew': {
      name: '门牌查询新',
      icon: 'search',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateSearchnew/DoorplateSearch')
      ),
    },
    '/placemanage/doorplate/doorplatemanage': {
      name: '门牌维护',
      icon: 'edit',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateManage/DoorplateManage')
      ),
    },
    '/placemanage/doorplate/doorplateadd': {
      name: '门牌编制',
      icon: 'edit',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateAdd/DoorplateAdd')
      ),
    },
    '/placemanage/doorplate/doorplatechange': {
      name: '门牌变更',
      icon: 'retweet',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateChange/DoorplateChange')
      ),
    },
    '/placemanage/doorplate/doorplatereplace': {
      name: '门牌换补',
      icon: 'file-text',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateReplace/DoorplateReplace')
      ),
    },
    '/placemanage/doorplate/doorplatedelete': {
      name: '门牌注销',
      icon: 'delete',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateDelete/DoorplateDelete')
      ),
    },
    '/placemanage/doorplate/doorplatemaking': {
      name: '门牌制作',
      icon: 'tool',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateMaking/DoorplateMaking')
      ),
    },
    '/placemanage/doorplate/doorplatestatistic': {
      name: '业务统计',
      icon: 'pie-chart',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateStatistic/DoorplateStatistic')
      ),
    },

    /* 地名证明 */
    '/placemanage/toponymyprove': {
      name: '地名证明',
      style: { fontSize: '26px' },
      aicon: 'icon-zhengmingwenjian',
      component: dynamicWrapper(app, [], () => import('../routes/ToponymyProve/ToponymyProve')),
    },

    /* 路牌管理 */
    '/placemanage/guidepost': {
      name: '路牌管理',
      style: { fontSize: '26px' },
      aicon: 'icon-zhishipai',
      component: dynamicWrapper(app, [], () => import('../routes/Guidepost/Guidepost')),
    },
    '/placemanage/guidepost/gpsearch': {
      name: '路牌查询',
      icon: 'search',
      component: dynamicWrapper(app, [], () => import('../routes/Guidepost/GPSearch/GPSearch')),
    },
    '/placemanage/guidepost/gpmanage': {
      name: '路牌维护',
      icon: 'edit',
      component: dynamicWrapper(app, [], () => import('../routes/Guidepost/GPManage/GPManage')),
    },
    '/placemanage/guidepost/gpstatistic': {
      name: '路牌统计',
      icon: 'pie-chart',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Guidepost/GPStatistic/GPStatistic')
      ),
    },

    /*出具意见*/
    '/placemanage/expressopinions': {
      name: '出具意见',
      style: { fontSize: '26px' },
      aicon: 'icon-yijian',
      component: dynamicWrapper(app, [], () => import('../routes/ExpressOpinions/ExpressOpinions')),
    },
    '/placemanage/expressopinions/basearch': {
      name: '备案查询',
      icon: 'search',
      component: dynamicWrapper(app, [], () =>
        import('../routes/ExpressOpinions/BASearch/BASearch')
      ),
    },
    '/placemanage/expressopinions/bamanage': {
      name: '地名备案',
      icon: 'edit',
      component: dynamicWrapper(app, [], () =>
        import('../routes/ExpressOpinions/BAManage/BAManage')
      ),
    },

    /* 地名管理 */
    '/placemanage/toponymy': {
      name: '地名管理',
      aicon: 'icon-paizhao',
      style: { fontSize: '18px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () => import('../routes/Toponymy/Toponymy')),
    },
    '/placemanage/toponymy/toponymysearch': {
      name: '地名查询',
      icon: 'search',
      style: { fontSize: '18px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () =>
        import('../routes/Toponymy/ToponymySearch/ToponymySearch')
      ),
    },
    '/placemanage/toponymy/toponymyaccept': {
      name: '地名受理',
      icon: 'edit',
      style: { fontSize: '18px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () =>
        import('../routes/Toponymy/ToponymyAccept/ToponymyAccept')
      ),
    },
    '/placemanage/toponymy/toponymypreapproval': {
      name: '地名预命名',
      icon: 'edit',
      style: { fontSize: '18px', margin: '6px 0px 6px 12px' },
      component: dynamicWrapper(app, [], () =>
        import('../routes/Toponymy/ToponymyPreApproval/ToponymyPreApproval')
      ),
    },
    '/placemanage/toponymy/toponymyapproval': {
      name: '地名命名',
      icon: 'form',
      style: { fontSize: '18px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () =>
        import('../routes/Toponymy/ToponymyApproval/ToponymyApproval')
      ),
    },
    '/placemanage/toponymy/toponymyrename': {
      name: '地名更名',
      icon: 'retweet',
      style: { fontSize: '18px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () =>
        import('../routes/Toponymy/ToponymyRename/ToponymyRename')
      ),
    },
    '/placemanage/toponymy/toponymyreplace': {
      name: '地名换补',
      icon: 'file-text',
      style: { fontSize: '18px', margin: '6px 0px 6px 12px' },
      component: dynamicWrapper(app, [], () =>
        import('../routes/Toponymy/ToponymyReplace/ToponymyReplace')
      ),
    },
    '/placemanage/toponymy/toponymycancel': {
      name: '地名销名',
      icon: 'delete',
      style: { fontSize: '18px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () =>
        import('../routes/Toponymy/ToponymyCancel/ToponymyCancel')
      ),
    },

    /*系统维护*/
    '/systemmaintain': {
      component: dynamicWrapper(app, [], () => import('../routes/SystemMaintain/SystemMaintain')),
    },

    /*字典管理*/
    '/systemmaintain/dicmanage': {
      name: '字典管理',
      aicon: 'icon-shujuzidian-',
      style: { fontSize: '24px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () => import('../routes/DicManage/DicManage')),
    },
    '/systemmaintain/dicmanage/district': {
      name: '行政区划',
      icon: 'global',
      component: dynamicWrapper(app, [], () => import('../routes/DicManage/District/District')),
    },
    '/systemmaintain/dicmanage/postcode': {
      name: '邮政编码',
      icon: 'mail',
      component: dynamicWrapper(app, [], () => import('../routes/DicManage/PostCode/PostCode')),
    },
    '/systemmaintain/dicmanage/mpbz': {
      name: '门牌标志',
      icon: 'code',
      component: dynamicWrapper(app, [], () => import('../routes/DicManage/MPBZ/MPBZ')),
    },
    '/systemmaintain/dicmanage/rpbz': {
      name: '路牌管维',
      icon: 'tags',
      component: dynamicWrapper(app, [], () => import('../routes/DicManage/RPBZ/RPBZ')),
    },
    /* 地理信息服务 */
    '/services': {
      name: '地理信息服务',
      component: dynamicWrapper(app, [], () =>
        import('../routes/UnderConstruction/UnderConstruction')
      ),
    },
    /* 数据统计分析 */
    '/dataanalysis': {
      name: '数据统计分析',
      component: dynamicWrapper(app, [], () =>
        import('../routes/UnderConstruction/UnderConstruction')
      ),
    },
    /*用户、权限管理*/
    '/systemmaintain/userrolemanage': {
      name: '权限管理',
      aicon: 'icon-weibiaoti-',
      style: { fontSize: '24px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () => import('../routes/UserRoleManage/UserRoleManage')),
    },
    '/systemmaintain/userrolemanage/usermanage': {
      name: '用户管理',
      icon: 'user',
      component: dynamicWrapper(app, [], () =>
        import('../routes/UserRoleManage/UserManage/UserManage')
      ),
    },
    '/systemmaintain/userrolemanage/rolemanage': {
      name: '角色管理',
      icon: 'key',
      component: dynamicWrapper(app, [], () =>
        import('../routes/UserRoleManage/RoleManage/RoleManage')
      ),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
