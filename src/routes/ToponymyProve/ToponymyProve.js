import React, { Component } from 'react';

import st from './ToponymyProve.less';
import HDProve from './HDProve.js';
import RDProve from './RDProve.js';
import VGProve from './VGProve.js';

class ToponymyProve extends Component {
  state = {
    current: 'HouseDoorplate',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'VillageDoorplate':
        return <VGProve />;
      case 'RoadDoorplate':
        return <RDProve />;
      default:
        return <HDProve />;
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
      <div className={st.ToponymyProve}>
        <div>
          <div ref={e => (this.navs = e)} className={st.navs}>
            <div className="active" data-target="HouseDoorplate">
              住宅门牌
            </div>
            <div data-target="RoadDoorplate">道路门牌</div>
            <div data-target="VillageDoorplate">农村门牌</div>
          </div>
          <div className={st.content}>{this.getContent()}</div>
        </div>
      </div>
    );
  }
}
export default ToponymyProve;
