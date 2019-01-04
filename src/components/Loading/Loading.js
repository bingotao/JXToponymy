import React, { Component } from 'react';
import { Spin } from 'antd';
import st from './Loading.less';

class Loading extends Component {
  state = {
    loading: true,
  };

  componentDidMount() {
    setTimeout(e => {
      this.setState({ loading: false });
    }, 1000);
  }

  render() {
    let { loading } = this.state;
    return loading ? (
      <div ref={e => (this.root = e)} className={st.Loading}>
        <Spin tip="加载中..." spinning={true} />
      </div>
    ) : null;
  }
}

export default Loading;
