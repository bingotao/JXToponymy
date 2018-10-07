import React, { Component } from 'react';

import st from './GPStatistic.less';

import GPCount from './GPCount';
import GPRepairCount from './GPRepairCount';

class GPStatistic extends Component {
  state = {
    current: "GPCount"
  }

  getContent() {
    let { current } = this.state;
    switch (current) {
      case "GPCount":
        return <GPCount />;
      case "GPRepairCount":
        return <GPRepairCount />;
      default:
        return <div>未找到</div>
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
      <div className={st.GPStatistic}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="GPCount">
            路牌数量
          </div>
          <div data-target="GPRepairCount">维护统计</div>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default GPStatistic;
