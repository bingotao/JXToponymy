import React, { Component } from 'react';

import HouseDoorplate from './HouseDoorplate.js';
import RoadDoorplate from './RoadDoorplate.js';
import VillageDoorplate from './VillageDoorplate.js';


import st from './DoorplateSearch.less';

class DoorplateSearch extends Component {
  state = {
    current: 'HouseDoorplate',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'RoadDoorplate':
        return <RoadDoorplate />;
      case 'VillageDoorplate':
        return <VillageDoorplate />;
      default:
        return <HouseDoorplate />;
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
      <div className={st.DoorplateSearch}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="HouseDoorplate">
            住宅门牌
          </div>
          <div data-target="RoadDoorplate">道路门牌</div>
          <div data-target="VillageDoorplate">农村门牌</div>
         
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default DoorplateSearch;
