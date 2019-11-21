import React, { Component } from 'react';

import st from './ToponymyProve.less';
import HDProve from './HDProve.js';
import RDProve from './RDProve.js';
import VGProve from './VGProve.js';
import Authorized from '../../utils/Authorized4';

class ToponymyProve extends Component {
  state = {
    current: 'HDForm',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'VGForm':
        return (
          <Authorized>
            <VGProve />
          </Authorized>
        );
      case 'RDForm':
        return (
          <Authorized>
            <RDProve />
          </Authorized>
        );
      default:
        return (
          <Authorized>
            <HDProve />
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
      <div className={st.ToponymyProve}>
        <div>
          <div ref={e => (this.navs = e)} className={st.navs}>
            {current == 'HDForm' ? (
              <div className="active" data-target="HDForm">
                住宅门牌
              </div>
            ) : null}
            {current == 'RDForm' ? (
              <div className="active" data-target="RDForm">
                道路门牌
              </div>
            ) : null}
            {current == 'VGForm' ? (
              <div className="active" data-target="VGForm">
                农村门牌
              </div>
            ) : null}
          </div>
          <div className={st.content}>{this.getContent()}</div>
        </div>
      </div>
    );
  }
}
export default ToponymyProve;
