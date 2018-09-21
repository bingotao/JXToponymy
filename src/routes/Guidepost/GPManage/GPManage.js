import React, { Component } from 'react';

import st from './GPManage.less';

import GPForm from '../Forms/GPForm.js';
import GPRepair from '../Forms/GPRepair.js';

class GPManage extends Component {
  state = {
    current: 'GPForm',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'GPRepair':
        return <GPRepair />;
      default:
        return <GPForm />;
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
      <div className={st.GPManage}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="GPForm">
            路牌追加
          </div>
          <div data-target="GPRepair">路牌维护</div>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default GPManage;
