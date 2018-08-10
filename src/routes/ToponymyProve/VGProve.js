import React, { Component } from 'react';
import { Cascader, Input, Button, Table, Pagination, Icon, Modal } from 'antd';
import st from './VGProve.less';
import GetColumns from './ProveColumns.js';
import VGForm from '../Doorplate/Forms/VGForm.js';
import ProveForm from './ProveForm.js';
class VGProve extends Component {
  constructor(ps) {
    super(ps);
    this.columns = GetColumns();
    this.columns.push({
      title: '操作',
      key: 'operation',
      width: 160,
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
            <Icon type="printer" title="打印" onClick={e => this.onPrint(i)} />
            <Icon type="delete" title="删除" onClick={e => this.onDelete(i)} />
          </div>
        );
      },
    });
  }

  state = {
    showEditForm: false,
    showProveForm: false,
  };
  closeEditForm() {
    this.setState({ showEditForm: false });
  }
  closeProveForm() {
    this.setState({ showProveForm: false });
  }
  onEdit(e) {
    this.setState({ showEditForm: true });
  }
  onPrint(e) {
    this.setState({ showProveForm: true });
  }
  onDelete(e) {}
  render() {
    let { showEditForm, showProveForm } = this.state;
    return (
      <div className={st.VGProve}>
        <div className={st.header}>
          <Cascader placeholder="行政区划" />
          <Input placeholder="产权人" style={{ width: '200px', marginLeft: '10px' }} />
          <Input placeholder="标准地址" style={{ width: '200px', marginLeft: '10px' }} />
          <Button style={{ marginLeft: '10px' }} icon="search" type="primary">
            查询
          </Button>
        </div>
        <div className={st.body}>
          <Table dataSource={[{}]} columns={this.columns} pagination={false} />
        </div>
        <div className={st.footer}>
          <Pagination />
        </div>
        {showEditForm ? (
          <Modal
            wrapClassName={st.form}
            visible={true}
            onCancel={this.closeEditForm.bind(this)}
            title="门牌编辑"
            footer={null}
          >
            <VGForm id={this.VG_ID} />
          </Modal>
        ) : null}
        {showProveForm ? (
          <Modal
            visible={true}
            width={800}
            onCancel={this.closeProveForm.bind(this)}
            title="地名证明"
            footer={null}
          >
            <ProveForm id={this.PF_ID} />
          </Modal>
        ) : null}
      </div>
    );
  }
}

export default VGProve;
