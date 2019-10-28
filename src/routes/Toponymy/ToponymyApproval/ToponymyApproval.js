import React, { Component } from 'react';
import SettlementForm from '../Forms/SettlementForm.js';
import BuildingForm from '../Forms/BuildingForm.js';
import RoadForm from '../Forms/RoadForm.js';
import BridgeForm from '../Forms/BridgeForm.js';
import Authorized from '../../../utils/Authorized4';

import st from './ToponymyApproval.less';

class ToponymyApproval extends Component {
  state = {
    current: 'SettlementForm',
    reset: false,
  };
  getContent() {
    let { current } = this.state;

    switch (current) {
      case 'SettlementForm':
        return (
          <Authorized>
            <SettlementForm FormType="SettlementBuildingMM" />
          </Authorized>
        );
      case 'BuildingForm':
        return (
          <Authorized>
            <BuildingForm FormType="SettlementBuildingMM" />
          </Authorized>
        );
      case 'RoadForm':
        return (
          <Authorized>
            <RoadForm FormType="RoadBridgeMM" />
          </Authorized>
        );
      case 'BridgeForm':
        return (
          <Authorized>
            <BridgeForm FormType="RoadBridgeMM" />
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
    let { reset } = this.state;
    return (
      <div className={st.ToponymyApproval}>
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

export default ToponymyApproval;
