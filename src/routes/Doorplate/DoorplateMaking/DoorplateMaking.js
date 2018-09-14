import React, { Component } from 'react';

import LXMaking from './LXMaking.js';
import st from './DoorplateMaking.less';

class DoorplateMaking extends Component {
  state = {
    current: 'LXMaking',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'LXMaking':
        return <LXMaking />;
      default:
        return <div>批量门牌制作表</div>;
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
      <div className={st.DoorplateMaking}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="LXMaking">
            零星制作
          </div>
          <div data-target="PLMaking">批量制作</div>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default DoorplateMaking;
