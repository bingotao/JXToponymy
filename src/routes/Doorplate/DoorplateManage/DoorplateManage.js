import React, { Component } from 'react';
import { Button } from 'antd';
import HDForm from '../Forms/HDForm.js';
import RDForm from '../Forms/RDForm.js';
import VGFrom from '../Forms/VGForm.js';
//import DoorplateImport from './DoorplateImport.js';

import st from './DoorplateManage.less';

class DoorplateManage extends Component {
  state = {
    current: 'HDForm',
    reset: false,
  };

  getContent() {
    let { current } = this.state;
    let { privilege } = this.props;
    switch (current) {
      // case 'DoorplateImport':
      //   return <DoorplateImport />;
      case 'RDForm':
        return <RDForm privilege={privilege} />;
      case 'VGForm':
        return <VGFrom privilege={privilege} />;
      default:
        return <HDForm privilege={privilege} />;
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
    let { reset } = this.state;
    return (
      <div className={st.DoorplateManage}>
        <div className={st.reset}>
          <Button
            type="primary"
            icon="file-add"
            onClick={e => this.setState({ reset: true }, e => this.setState({ reset: false }))}
          >
            追加门牌
          </Button>
        </div>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="HDForm">
            住宅门牌
          </div>
          <div data-target="RDForm">道路门牌</div>
          <div data-target="VGForm">农村门牌</div>
          {/* <div data-target="DoorplateImport">批量导入</div> */}
        </div>
        <div className={st.content}>{reset ? null : this.getContent()}</div>
      </div>
    );
  }
}

export default DoorplateManage;
