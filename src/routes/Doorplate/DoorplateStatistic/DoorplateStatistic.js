import React, { Component } from 'react';

import st from './DoorplateStatistic.less';

import PersonStatistic from './PersonStatistic.js';
import AreaStatistic from './AreaStatistic.js';
import CountStatisitic from './CountStatisitic.js';

class DoorplateStatistic extends Component {
  state = {
    current: 'PersonStatistic',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'PersonStatistic':
        return <PersonStatistic />;
      case 'CountStatistic':
        return <CountStatisitic />;
      case 'AreaStatistic':
        return <AreaStatistic />
      default:
        return <div >未找到相应组件</div>;
    }
  }

  componentDidMount() {
    let that = this;
    $(this.navs)
      .find('div')
      .on('click', function () {
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
          <div className="active" data-target="PersonStatistic">
            个人统计
          </div>
          <div data-target="CountStatistic">数量统计</div>
          <div data-target="AreaStatistic">门牌统计</div>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default DoorplateStatistic;
