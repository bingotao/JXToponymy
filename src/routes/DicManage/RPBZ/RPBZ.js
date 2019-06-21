import React, { Component } from 'react';
import RPLX from './RPLX.js';
import CJLX from './CJLX.js';
import WXLX from './WXLX.js';
import Authorized from '../../../utils/Authorized4';

import st from './RPBZ.less';

class DoorplateSearch extends Component {
  state = {
    current: 'RPLX',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'RPLX':
        return (
          <Authorized>
            <RPLX />
          </Authorized>
        );
      case 'CJLX':
        return (
          <Authorized>
            <CJLX />
          </Authorized>
        );
      default:
        return (
          <Authorized>
            <WXLX />
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
    return (
      <div className={st.RPBZ}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <Authorized>
            <div className="active" data-target="LPLX">
              路牌类型
            </div>
          </Authorized>
          <Authorized>
            <div data-target="CJLX">厂家类型</div>
          </Authorized>
          <Authorized>
            <div data-target="WXLX">维修类型</div>
          </Authorized>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default DoorplateSearch;
