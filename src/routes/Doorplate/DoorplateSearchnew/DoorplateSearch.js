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
      : 'HouseDoorplate',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'RoadDoorplate':
        return (
          <Authorized>
            <RoadDoorplate />
          </Authorized>
        );
      case 'VillageDoorplate':
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
    var s = this.state;
    return (
      <div className={st.DoorplateSearch}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <Authorized>
            <div
              className={s.current == 'HouseDoorplate' ? 'active' : null}
              data-target="HouseDoorplate"
            >
              住宅门牌
            </div>
          </Authorized>
          <Authorized>
            <div
              className={s.current == 'RoadDoorplate' ? 'active' : null}
              data-target="RoadDoorplate"
            >
              道路门牌
            </div>
          </Authorized>
          <Authorized>
            <div
              className={s.current == 'VillageDoorplate' ? 'active' : null}
              data-target="VillageDoorplate"
            >
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
