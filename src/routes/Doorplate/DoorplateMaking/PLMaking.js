import { Component } from 'react';
import { Table, Pagination, Radio, Button, Icon } from 'antd';
import st from './PLMaking.less';
import { Post } from '../../../utils/request.js';
import { getProducedPLMP, getNotProducedPLMP } from '../../../services/MPMaking';

let columns = [
  { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
  { title: '申报单位', align: 'center', dataIndex: 'SBDW', key: 'SBDW' },
  { title: '小区名称', align: 'center', dataIndex: 'ResidenceName', key: 'ResidenceName' },
  { title: '道路名称', align: 'center', dataIndex: 'RoadName', key: 'RoadName' },
  { title: '自然村名称', align: 'center', dataIndex: 'ViligeName', key: 'ViligeName' },
  { title: '数量', align: 'center', dataIndex: 'MPCount', key: 'MPCount' },
  { title: '申办人', align: 'center', dataIndex: 'Applicant', key: 'Applicant' },
  { title: '联系电话', align: 'center', dataIndex: 'ApplicantPhone', key: 'ApplicantPhone' },
  { title: '编制日期', align: 'center', dataIndex: 'MPBZTime', key: 'MPBZTime' },
];

class PLMaking extends Component {
  state = {
    PLMPProduceComplete: 0,
    PageSize: 25,
    PageNum: 1,
    total: 0,
    rows: [],
    selectedRows: [],
    loading: false,
  };

  onShowSizeChange(pn, ps) {
    this.setState(
      {
        PageNum: pn,
        PageSize: ps,
      },
      e => this.search()
    );
  }

  async search() {
    let { PageNum, PageSize, PLMPProduceComplete } = this.state;
    this.setState({ loading: true });
    if (PLMPProduceComplete === 0) {
      await getNotProducedPLMP({ PageNum, PageSize }, e => {
        let { Count, Data } = e;
        let { PageNum, PageSize } = this.state;
        Data.map((item, idx) => {
          item.index = (PageNum - 1) * PageSize + idx + 1;
        });
        this.setState({
          rows: Data,
          total: Count,
        });
      });
    } else {
      await getProducedPLMP({ PageNum, PageSize }, e => {
        let { Count, Data } = e;
        let { PageNum, PageSize } = this.state;
        Data.map((item, idx) => {
          item.index = (PageNum - 1) * PageSize + idx + 1;
        });
        this.setState({
          rows: Data,
          total: Count,
        });
      });
    }
    this.setState({ loading: false });
  }

  making() {
    console.log(this.state.selectedRows);
  }

  onView(i) {
    console.log(i);
  }

  render() {
    var { PLMPProduceComplete, PageSize, PageNum, total, rows, selectedRows, loading } = this.state;
    return (
      <div className={st.PLMaking}>
        <div className={st.header}>
          <Radio.Group
            defaultValue={PLMPProduceComplete}
            buttonStyle="solid"
            onChange={e => {
              this.setState({
                PLMPProduceComplete: e.target.value,
                total: 0,
                rows: [],
                selectedRows: [],
                PageNum: 1,
              });
            }}
          >
            <Radio.Button value={0}>未制作</Radio.Button>
            <Radio.Button value={1}>已制作</Radio.Button>
          </Radio.Group>
          &emsp;
          <Button type="primary" icon="search" onClick={e => this.search({ PageNum: 1 })}>
            搜索
          </Button>
          &emsp;
          {PLMPProduceComplete === 0 && (
            <Button type="primary" icon="form" disabled={!total} onClick={this.making.bind(this)}>
              制作
            </Button>
          )}
        </div>
        <div className={st.body}>
          <Table
            bordered
            rowSelection={
              PLMPProduceComplete
                ? false
                : {
                    selectedRowKeys: selectedRows,
                    onChange: e => {
                      this.setState({ selectedRows: e });
                    },
                  }
            }
            pagination={false}
            columns={
              PLMPProduceComplete
                ? columns.concat({
                    title: '操作',
                    key: 'operation',
                    render: i => {
                      return (
                        <div className={st.rowbtns}>
                          <Icon type="edit" title="下载汇总表" onClick={e => this.onView(i)} />
                        </div>
                      );
                    },
                  })
                : columns
            }
            dataSource={rows}
            loading={loading}
          />
        </div>
        <div className={st.footer}>
          <Pagination
            showSizeChanger
            onShowSizeChange={(page, size) => this.onShowSizeChange(1, size)}
            current={PageNum}
            pageSize={PageSize}
            total={total}
            pageSizeOptions={[25, 50, 100, 200]}
            onChange={this.onShowSizeChange.bind(this)}
            showTotal={(total, range) =>
              total ? `共：${total} 条，当前：${range[0]}-${range[1]} 条` : ''
            }
          />
        </div>
      </div>
    );
  }
}

export default PLMaking;
