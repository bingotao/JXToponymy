import { Component } from 'react';

import { Table, Button, Modal, Icon } from 'antd';

import st from './GPRepairList.less';
import GPRepair from './GPRepair';

class GPRepairList extends Component {
  state = {
    loading: false,
    showGPRepair: false,
    rows: [{}],
  };

  columns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '维护方式', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    { title: '报修日期', align: 'center', dataIndex: 'RoadName', key: 'RoadName' },
    { title: '修复日期', align: 'center', dataIndex: 'Intersection', key: 'Intersection' },
    { title: '修复厂家', align: 'center', dataIndex: 'Direction', key: 'Direction' },
    { title: '维修内容', align: 'center', dataIndex: 'BZTime', key: 'BZTime' },
    { title: '修复状态', align: 'center', dataIndex: 'address', key: '5' },
    {
      title: '操作',
      width: 80,
      key: 'operation',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
          </div>
        );
      },
    },
  ];

  onEdit(i) {
    this.rpId = i.ID;
    this.rpId = 111;
    this.setState({ showGPRepair: true });
  }

  getRepaireList() {
    let { id } = this.props;
    if (id) {
      // 获取repair list
    }
  }

  componentDidMount() {
    this.getRepaireList();
  }

  render() {
    let { loading, rows, showGPRepair } = this.state;
    return (
      <div className={st.GPRepairList}>
        <div className={st.btns}>
          <Button
            type="primary"
            onClick={e => {
              this.gpId = this.props.id;
              this.rpId = null;
              this.setState({ showGPRepair: true });
            }}
          >
            添加维修记录
          </Button>
        </div>
        <div className={st.table}>
          <Table
            pagination={false}
            loading={loading}
            columns={this.columns}
            dataSource={rows}
            bordered
          />
        </div>
        <Modal
          wrapClassName="fullmodal"
          title={this.rpId ? '路牌维修' : '添加维修记录'}
          destroyOnClose={true}
          centered={true}
          visible={showGPRepair}
          onCancel={e => this.setState({ showGPRepair: false })}
          footer={null}
        >
          <GPRepair
            gpId={this.gpId}
            rpId={this.rpId}
            onCancelClick={e => this.setState({ showGPRepair: false })}
          />
        </Modal>
      </div>
    );
  }
}

export default GPRepairList;
