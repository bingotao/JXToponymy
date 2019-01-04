import { Component } from 'react';
import { Redirect } from 'dva/router';
import { Button } from 'antd';
import st from './UnderConstruction.less';

class UnderConstruction extends Component {
  state = {
    returnToHome: false,
  };

  render() {
    let { returnToHome } = this.state;

    return (
      <div className={st.UnderConstruction}>
        <div>
          正在努力建设中，敬请期待！！！
          <Button
            type="primary"
            onClick={e => {
              this.setState({ returnToHome: true });
            }}
          >
            返回首页
          </Button>
          {returnToHome ? <Redirect to="/home" /> : null}
        </div>
      </div>
    );
  }
}

export default UnderConstruction;
