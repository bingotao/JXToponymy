import React, { Component } from 'react';
import { Button } from 'antd';
import Authorized from '../../../utils/Authorized4';
import SettlementForm from '../Forms/SettlementForm.js';
import BuildingForm from '../Forms/BuildingForm.js';
import RoadForm from '../Forms/RoadForm.js';
import BridgeForm from '../Forms/BridgeForm.js';
import st from './ToponymyRename.less';

class ToponymyRename extends Component {
  state = {
    current: 'SettlementForm',
  };
  getContent() {
    let { current } = this.state;

    switch (current) {
      case 'SettlementForm':
        return (
          <Authorized>
            <SettlementForm FormType="GM" />
          </Authorized>
        );
      case 'BuildingForm':
        return (
          <Authorized>
            <BuildingForm FormType="GM" />
          </Authorized>
        );
      case 'RoadForm':
        return (
          <Authorized>
            <RoadForm FormType="GM" />
          </Authorized>
        );
      case 'BridgeForm':
        return (
          <Authorized>
            <BridgeForm FormType="GM" />
          </Authorized>
        );
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
    return (
      <div className={st.ToponymyRename}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="SettlementForm">
            居民点
          </div>
          <div data-target="BuildingForm">建筑物</div>
          <div data-target="RoadForm">道路街巷</div>
          <div data-target="BridgeForm">桥梁</div>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default ToponymyRename;
