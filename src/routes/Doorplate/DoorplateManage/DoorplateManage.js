import React, { Component } from 'react';

import HDForm from '../Forms/HDForm.js';
import RDForm from '../Forms/RDForm.js';
import VGFrom from '../Forms/VGForm.js';
import DoorplateImport from './DoorplateImport.js';

import st from './DoorplateManage.less';

class DoorplateManage extends Component {
  state = {
    current: 'HDForm',
  };

  getContent() {
    let { current } = this.state;
    switch (current) {
      case 'DoorplateImport':
        return <DoorplateImport />;
      case 'RDForm':
        return <RDForm />;
      case 'VGForm':
        return <VGFrom />;
      default:
        return <HDForm />;
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
      <div className={st.DoorplateManage}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="HDForm">
            住宅门牌
          </div>
          <div data-target="RDForm">道路门牌</div>
          <div data-target="VGForm">农村门牌</div>
          <div data-target="DoorplateImport">批量导入</div>
        </div>
        <div className={st.content}>{this.getContent()}</div>
      </div>
    );
  }
}

export default DoorplateManage;

