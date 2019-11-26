import React, { Component } from 'react';

import st from './ToponymyStatistic.less';

import DmStatistic from './DmStatistic.js';
import Authorized from '../../../utils/Authorized4';

class ToponymyStatistic extends Component {
  state = {
    current: 'DmStatistic',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'DmStatistic':
        return (
          <Authorized>
            <DmStatistic />
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
      <div className={st.ToponymyStatistic}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="DmStatistic">
            业务量统计
          </div>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default ToponymyStatistic;
