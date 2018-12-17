import { Component } from 'react';
import { Table, Button, Modal, Icon, Popconfirm, notification } from 'antd';
import st from './GPRepairList.less';
import GPRepair from './GPRepair';
import { getRPRepairList, deleteRPRepair } from '../../../services/RPRepair';

class GPRepairList extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.privilege === 'edit';
  }
  state = {
    loading: false,
    showGPRepair: false,
    rows: [],
  };

  columns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '报修日期', align: 'center', dataIndex: 'RepairTime', key: 'RepairTime' },
    {
      title: '修复日期',
      align: 'center',
      dataIndex: 'FinishRepaireTime',
      key: 'FinishRepaireTime',
    },
    { title: '维修厂家', align: 'center', dataIndex: 'RepairFactory', key: 'RepairFactory' },
    { title: '维修内容', align: 'center', dataIndex: 'RepairContent', key: 'RepairContent' },
    {
      title: '修复状态',
      align: 'center',
      dataIndex: 'FinishRepaireTime',
      key: 'FinishRepaireTime',
      render: (text, record, index) => {
        return text ? <div className={st.yxf}>已修复</div> : <div className={st.wxf}>未修复</div>;
      },
    },
    {
      title: '操作',
      width: 80,
      key: 'operation',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="查看" onClick={e => this.onEdit(i)} />
            {this.getEditComponent(
              <Popconfirm
                title="确定删除该维修记录？"
                placement="left"
                onConfirm={e => this.onCancel(i)}
              >
                <Icon type="rollback" title="注销" />
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];
  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }
  async onCancel(i) {
    await deleteRPRepair({ repairId: i.ID }, e => {
      notification.success({ description: '门牌已注销！', message: '成功' });
      this.getRepairList();
    });
  }

  onEdit(i) {
    this.gpId = this.props.gpId;
    this.rpId = i.ID;
    this.setState({ showGPRepair: true });
  }

  async getRepairList() {
    let { gpId } = this.props;
    if (gpId) {
      this.setState({ loading: true });
      await getRPRepairList({ id: gpId }, data => {
        if (data && data.RepairInfos) {
          data.RepairInfos.map((e, i) => (e.index = i + 1));
          this.setState({ rows: data.RepairInfos });
        }
      });
      this.setState({ loading: false });
    }
  }

  componentDidMount() {
    this.getRepairList();
  }

  render() {
    let { loading, rows, showGPRepair } = this.state;
    return (
      <div className={st.GPRepairList}>
        <div className={st.btns}>
          {this.getEditComponent(
            <Button
              type="primary"
              onClick={e => {
                this.gpId = this.props.gpId;
                this.rpId = null;
                this.setState({ showGPRepair: true });
              }}
            >
              添加维修记录
            </Button>
          )}
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
            privilege={this.props.privilege}
            gpId={this.gpId}
            rpId={this.rpId}
            onCancelClick={e => this.setState({ showGPRepair: false })}
            onSaveSuccess={e => {
              this.getRepairList();
              if (this.props.onSaveSuccess) this.props.onSaveSuccess();
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default GPRepairList;
