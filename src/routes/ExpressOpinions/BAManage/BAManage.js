import React, { Component } from 'react';
import { Button } from 'antd';
import st from './BAManage.less';

import BAForm from '../Forms/BAForm.js';
import Authorized from '../../../utils/Authorized4';

class BAManage extends Component {
  state = {
    reset: false,
  };

  render() {
    let { reset } = this.state;
    return (
      <div className={st.BAManage}>
        <div className={st.reset}>
          <Button
            type="primary"
            icon="file-add"
            onClick={e => this.setState({ reset: true }, e => this.setState({ reset: false }))}
          >
            追加备案
          </Button>
        </div>
        <div className={st.content}>
          {reset ? null : (
            <Authorized>
              <BAForm />
            </Authorized>
          )}
        </div>
      </div>
    );
  }
}

export default BAManage;
