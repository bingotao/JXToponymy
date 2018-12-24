import React, { Component } from 'react';
import { Button } from 'antd';
import st from './GPManage.less';

import GPForm from '../Forms/GPForm.js';
import Authorized from '../../../utils/Authorized4';

class GPManage extends Component {
  state = {
    reset: false,
  };

  render() {
    let { reset } = this.state;
    return (
      <div className={st.GPManage}>
        <div className={st.reset}>
          <Button
            type="primary"
            icon="file-add"
            onClick={e => this.setState({ reset: true }, e => this.setState({ reset: false }))}
          >
            追加路牌
          </Button>
        </div>
        <div className={st.content}>
          {reset ? null : (
            <Authorized>
              <GPForm />
            </Authorized>
          )}
        </div>
      </div>
    );
  }
}

export default GPManage;
