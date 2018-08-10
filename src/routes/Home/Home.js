import React, { Component } from 'react';
import { Input } from 'antd';
import { Link } from 'dva/router';
import Navs from '../../common/Navs/Navs';
import st from './Home.less';

class Home extends Component {
  render() {
    return (
      <div className={st.home}>
        <Navs />
      </div>
    );
  }
}
export default Home;
