import React, { Component } from 'react';
import { Table, Pagination, Button, Radio } from 'antd';
import { GetHDColumns, GetRDColumns, GetVGColumns } from '../DoorplateColumns.js';

import st from './DoorplateImport.less';

let columns = {
  HD: GetHDColumns(),
  RD: GetRDColumns(),
  VG: GetVGColumns(),
};

class DoorplateImport extends Component {
  state = {
    current: 'HD',
  };

  render() {
    return (
      <div className={st.DoorplateImport}>
        <div style={{ marginTop: '5px' }}>
          <Radio.Group defaultValue="HD" onChange={e => this.setState({ current: e.target.value })}>
            <Radio.Button value="HD">住宅门牌</Radio.Button>
            <Radio.Button value="RD">道路门牌</Radio.Button>
            <Radio.Button value="VG">农村门牌</Radio.Button>
          </Radio.Group>
          &emsp;
          <Button type="primary" icon="upload">
            上传
          </Button>
          &emsp;
          <Button type="primary" icon="cloud-upload-o" disabled={true}>
            导入
          </Button>
        </div>
        <div className={st.body}>
          <Table columns={columns[this.state.current]} />
        </div>
        <div className={st.footer}>
          <Pagination />
        </div>
      </div>
    );
  }
}

export default DoorplateImport;
