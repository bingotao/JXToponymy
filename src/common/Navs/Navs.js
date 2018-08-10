import { Link } from 'dva/router';
import React, { Component } from 'react';
import { Input } from 'antd';
import st from './Navs.less';

class Navs extends Component {
  render() {
    const navs = [
      {
        id: 'home',
        name: '首 页',
        to: '/home',
      },
      {
        id: 'toponymy',
        name: '地名业务',
        to: '/toponymy',
      },
      {
        id: 'doorplate',
        name: '门牌管理',
        to: '/doorplate/doorplatesearch',
      },
      {
        id: 'guideboard',
        name: '路牌管理',
        to: '/guideboard',
      },
      {
        id: 'management',
        name: '用户管理',
        to: '/management',
      },
    ];
    return (
      <div className={st.navs}>
        <div className={st.header}>
          <div className={st.logo}>
            <span className="iconfont icon-iconset0403" />嘉兴市地名管理系统
          </div>
          <div className={st.toolbar}>
            <span className={st.sign}>注册</span>
            <span className={st.login}>登录</span>
          </div>
        </div>
        <div className={st.navs}>
          <div>
            {navs.map(i => (
              <Link to={i.to} key={i.id}>
                {i.name}
              </Link>
            ))}
            <Input placeholder="搜索..." />
          </div>
        </div>
      </div>
    );
  }
}

export default Navs;
