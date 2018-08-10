import React, { Component } from 'react';
import {} from 'antd';
import Navs from '../../common/Navs/Navs';
import Panel from '../../common/Panel/Panel';
import st from './Doorplate.less';

class Doorplate extends Component {
  render() {
    return (
      <div className={st.doorplate}>
        <Navs />
        <div className={st.body}>
          <Panel />
        </div>
      </div>
    );
  }
}
export default Doorplate;
