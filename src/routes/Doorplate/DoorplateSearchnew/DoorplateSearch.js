import React, { Component } from 'react';
import HouseDoorplate from './HouseDoorplate.js';
import RoadDoorplate from './RoadDoorplate.js';
import VillageDoorplate from './VillageDoorplate.js';
import Authorized from '../../../utils/Authorized4';

import st from './DoorplateSearch.less';

class DoorplateSearch extends Component {
  state = {
    current: this.props.history.location.state
      ? this.props.history.location.state.activeTab
      : 'HDForm',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'RDForm':
        return (
          <Authorized>
            <RoadDoorplate />
          </Authorized>
        );
      case 'VGForm':
        return (
          <Authorized>
            <VillageDoorplate />
          </Authorized>
        );
      default:
        return (
          <Authorized>
            <HouseDoorplate />
          </Authorized>
        );
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
    let { current } = this.state;

    return (
      <div className={st.DoorplateSearch}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <Authorized>
            <div className={current == 'HDForm' ? 'active' : null} data-target="HDForm">
              住宅门牌
            </div>
          </Authorized>
          <Authorized>
            <div className={current == 'RDForm' ? 'active' : null} data-target="RDForm">
              道路门牌
            </div>
          </Authorized>
          <Authorized>
            <div className={current == 'VGForm' ? 'active' : null} data-target="VGForm">
              农村门牌
            </div>
          </Authorized>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default DoorplateSearch;
