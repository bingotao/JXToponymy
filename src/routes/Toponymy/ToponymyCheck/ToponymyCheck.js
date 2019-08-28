import React, { Component } from 'react';
import { Button } from 'antd';
import Authorized from '../../../utils/Authorized4';

import st from './ToponymyCheck.less';

class ToponymyCheck extends Component {
  state = {
    current: 'SettlementForm',
    reset: false,
  };
  getContent() {
    let { current } = this.state;

    switch (current) {
      case 'SettlementForm':
        return <Authorized />;
      case 'BuildingForm':
        return <Authorized />;
      case 'RoadForm':
        return <Authorized />;
      default:
        return <Authorized />;
    }
  }
  componentDidMount() {
    let that = this;
    $(this.navs)
      .find('div')
      .on('click', function() {
        let ac = 'active';
        let $this = $(this);
        $this
          .addClass(ac)
          .siblings()
          .removeClass(ac);

        that.setState({ current: $this.data('target') });
      });
  }
  render() {
    let { reset } = this.state;
    return (
      <div className={st.ToponymyCheck}>
        <div className={st.reset}>
          <Button
            type="primary"
            icon="file-add"
            onClick={e => this.setState({ reset: true }, e => this.setState({ reset: false }))}
          >
            追加地名
          </Button>
        </div>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="SettlementForm">
            居民点
          </div>
          <div data-target="BuildingForm">建筑物</div>
          <div data-target="RoadForm">道路街巷</div>
          <div data-target="BridgeForm">桥梁</div>
        </div>
        <div className={st.content}>{reset ? null : this.getContent()}</div>
      </div>
    );
  }
}

export default ToponymyCheck;
