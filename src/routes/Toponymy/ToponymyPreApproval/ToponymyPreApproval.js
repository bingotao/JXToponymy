import React, { Component } from 'react';
import { Button } from 'antd';
import Authorized from '../../../utils/Authorized4';
import SettlementForm from '../Forms/SettlementForm.js';
import BuildingForm from '../Forms/BuildingForm.js';
import st from './ToponymyPreApproval.less';

class ToponymyAccept extends Component {
  state = {
    current: 'SettlementForm',
  };
  getContent() {
    let { current } = this.state;

    switch (current) {
      case 'SettlementForm':
        return (
          <Authorized>
            <SettlementForm />
          </Authorized>
        );
      case 'BuildingForm':
        return (
          <Authorized>
            <BuildingForm />
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
      <div className={st.ToponymyAccept}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="SettlementForm">
            居民点
          </div>
          <div data-target="BuildingForm">建筑物</div>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default ToponymyAccept;
