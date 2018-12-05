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
    // '/': {
    //   component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    // },
    // '/dashboard/analysis': {
    //   component: dynamicWrapper(app, ['chart'], () => import('../routes/Dashboard/Analysis')),
    // },
    // '/dashboard/monitor': {
    //   component: dynamicWrapper(app, ['monitor'], () => import('../routes/Dashboard/Monitor')),
    // },
    // '/dashboard/workplace': {
    //   component: dynamicWrapper(app, ['project', 'activities', 'chart'], () =>
    //     import('../routes/Dashboard/Workplace')
    //   ),
    //   // hideInBreadcrumb: true,
    //   // name: '工作台',
    //   // authority: 'admin',
    // },
    // '/form/basic-form': {
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/BasicForm')),
    // },
    // '/form/step-form': {
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm')),
    // },
    // '/form/step-form/info': {
    //   name: '分步表单（填写转账信息）',
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step1')),
    // },
    // '/form/step-form/confirm': {
    //   name: '分步表单（确认转账信息）',
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step2')),
    // },
    // '/form/step-form/result': {
    //   name: '分步表单（完成）',
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step3')),
    // },
    // '/form/advanced-form': {
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/AdvancedForm')),
    // },
    // '/list/table-list': {
    //   component: dynamicWrapper(app, ['rule'], () => import('../routes/List/TableList')),
    // },
    // '/list/basic-list': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/BasicList')),
    // },
    // '/list/card-list': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/CardList')),
    // },
    // '/list/search': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/List')),
    // },
    // '/list/search/projects': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Projects')),
    // },
    // '/list/search/applications': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Applications')),
    // },
    // '/list/search/articles': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Articles')),
    // },
    // '/profile/basic': {
    //   component: dynamicWrapper(app, ['profile'], () => import('../routes/Profile/BasicProfile')),
    // },
    // '/profile/advanced': {
    //   component: dynamicWrapper(app, ['profile'], () =>
    //     import('../routes/Profile/AdvancedProfile')
    //   ),
    // },
    // '/result/success': {
    //   component: dynamicWrapper(app, [], () => import('../routes/Result/Success')),
    // },
    // '/result/fail': {
    //   component: dynamicWrapper(app, [], () => import('../routes/Result/Error')),
    // },
    // '/exception/403': {
    //   component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    // },
    // '/exception/404': {
    //   component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    // },
    // '/exception/500': {
    //   component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    // },
    // '/exception/trigger': {
    //   component: dynamicWrapper(app, ['error'], () =>
    //     import('../routes/Exception/triggerException')
    //   ),
    // },
    // '/user': {
    //   component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    // },
    // '/user/login': {
    //   component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    // },
    // '/user/register': {
    //   component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    // },
    // '/user/register-result': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    // },
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
    '/login':{
      component: dynamicWrapper(app, [], () => import('../routes/Login/Login')),
    },
    '/home': {
      component: dynamicWrapper(app, [], () => import('../routes/Home/Home')),
    },
    /* 地名管理 */
    '/placemanage': {
      component: dynamicWrapper(app, [], () => import('../routes/PlaceManage/PlaceManage')),
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
    '/placemanage/doorplate/doorplatemanage': {
      name: '门牌维护',
      icon: 'edit',
      component: dynamicWrapper(app, [], () =>
        import('../routes/Doorplate/DoorplateManage/DoorplateManage')
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
      name: '路牌追加',
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
    /*系统维护*/
    '/systemmaintain': {
      component: dynamicWrapper(app, [], () => import('../routes/SystemMaintain/SystemMaintain')),
    },

    /*字典管理*/
    '/systemmaintain/dicmanage': {
      name: '字典管理',
      aicon: 'icon-paizhao',
      style: { fontSize: '18px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () => import('../routes/DicManage/DicManage')),
    },
    '/systemmaintain/dicmanage/district': {
      name: '行政区划字典',
      icon: 'global',
      component: dynamicWrapper(app, [], () =>
        import('../routes/DicManage/District/District')
      ),
    },
    '/systemmaintain/dicmanage/postcode': {
      name: '邮政编码字典',
      icon: 'mail',
      component: dynamicWrapper(app, [], () =>
        import('../routes/DicManage/PostCode/PostCode')
      ),
    },
    '/systemmaintain/dicmanage/mpbz': {
      name: '门牌编制字典',
      icon: 'code',
      component: dynamicWrapper(app, [], () =>
        import('../routes/DicManage/MPBZ/MPBZ')
      ),
    },
    '/systemmaintain/dicmanage/rpbz': {
      name: '路牌编制字典',
      icon: 'tags',
      component: dynamicWrapper(app, [], () =>
        import('../routes/DicManage/RPBZ/RPBZ')
      ),
    },

    /*用户、权限管理*/
    '/systemmaintain/userrolemanage': {
      name: '用户权限管理',
      aicon: 'icon-paizhao',
      style: { fontSize: '18px', margin: '6px 0' },
      component: dynamicWrapper(app, [], () => import('../routes/UserRoleManage/UserRoleManage')),
    },
    '/systemmaintain/userrolemanage/usermanage': {
      name: '用户管理',
      icon: 'global',
      component: dynamicWrapper(app, [], () =>
        import('../routes/UserRoleManage/UserManage/UserManage')
      ),
    },
    '/systemmaintain/userrolemanage/rolemanage': {
      name: '角色管理',
      icon: 'mail',
      component: dynamicWrapper(app, [], () =>
        import('../routes/UserRoleManage/RoleManage/RoleManage')
      ),
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
