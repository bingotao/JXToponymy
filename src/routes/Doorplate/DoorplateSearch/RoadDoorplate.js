import React, { Component } from 'react';
import { Cascader, Input, Button, Table, Pagination, Icon, Modal, Select, Radio } from 'antd';
import RDForm from '../Forms/RDForm.js';
import { GetRDColumns } from '../DoorplateColumns.js';

import st from './RoadDoorplate.less';

import { sjlx, mpdsh } from '../../../common/enums.js';

const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    index: i + 1,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}

class RoadDoorplate extends Component {
  constructor(ps) {
    super(ps);
    this.columns = GetRDColumns();
    this.columns.push({
      title: '操作',
      key: 'operation',
      width: 160,
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
            <Icon type="printer" title="打印地名证明" onClick={e => this.onPrint0(i)} />
            <Icon type="idcard" title="打印门牌证" onClick={e => this.onPrint1(i)} />
            <Icon type="delete" title="删除" onClick={e => this.onDelete(i)} />
          </div>
        );
      },
    });
  }

  state = {
    showEditForm: false,
    rows: [],
    total: 0,
  };

  closeEditForm() {
    this.setState({ showEditForm: false });
  }

  onEdit(e) {
    this.setState({ showEditForm: true });
  }

  onLocate(e) {
    console.log(e);
  }

  onCancel(e) {
    console.log(e);
  }

  onPrint0(e) {
    console.log(e);
  }

  onPrint1(e) {
    console.log(e);
  }

  onDelete(e) {
    console.log(e);
  }

  render() {
    let { total, showEditForm } = this.state;
    return (
      <div className={st.RoadDoorplate}>
        <div className={st.header}>
          <Cascader
            placeholder="请选择行政区"
            style={{ width: '300px'}}
            expandTrigger="hover"
          />
          <Input placeholder="道路名称" style={{ width: '200px', marginLeft: '10px' }} />
          <Select placeholder="数据类型" style={{ width: '100px', marginLeft: '10px' }}>
            {['全部'].concat(sjlx).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          <Select placeholder="单双号" style={{ width: '100px', marginLeft: '10px' }}>
            {['全部'].concat(mpdsh).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          <Button type="primary" icon="search" style={{ marginLeft: '10px' }}>
            搜索
          </Button>
          <Button  style={{ marginLeft: '10px' }}disabled={!total} type="default" icon="export" en>
            导出
          </Button>
        </div>
        <div className={st.body}>
          <Table pagination={false} columns={this.columns} dataSource={data} />
        </div>
        <div className={st.footer}>
          <Pagination />
        </div>
        {showEditForm ? (
          <Modal
            wrapClassName={st.rdform}
            visible={true}
            onCancel={this.closeEditForm.bind(this)}
            title="门牌编辑"
            footer={null}
          >
            <RDForm id={this.RD_ID} />
          </Modal>
        ) : null}
      </div>
    );
  }
}

export default RoadDoorplate;
