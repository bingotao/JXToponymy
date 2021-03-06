import React, { Component } from 'react';

import st from './DoorplateStatistic.less';

import PersonStatistic from './PersonStatistic.js';
import AreaStatistic from './AreaStatistic.js';
import CountStatisitic from './CountStatisitic.js';
import Authorized from '../../../utils/Authorized4';

class DoorplateStatistic extends Component {
  state = {
    current: 'CountStatistic',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'PersonStatistic':
        return (
          <Authorized>
            <PersonStatistic />
          </Authorized>
        );
      case 'CountStatistic':
        return (
          <Authorized>
            <CountStatisitic />
          </Authorized>
        );
      case 'AreaStatistic':
        return (
          <Authorized>
            <AreaStatistic />
          </Authorized>
        );
      default:
        return <div>未找到相应组件</div>;
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
      <div className={st.DoorplateStatistic}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="CountStatistic">
            业务量统计
          </div>
          <div data-target="PersonStatistic">详单统计</div>
          <div data-target="AreaStatistic">门牌统计</div>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default DoorplateStatistic;
