import { Component } from 'react';
import { Table, Pagination, Radio, Button } from 'antd';
import st from './PLMaking.less';
import { Post } from '../../../utils/request.js';
import { url_GetPLMPProduce, url_ProducePLMP } from '../../../common/urls.js';

let columns = [
  { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
  { title: '申报单位', dataIndex: 'SBDW', key: 'SBDW' },
  { title: '小区名称', dataIndex: 'ResidenceName', key: 'ResidenceName' },
  { title: '道路名称', dataIndex: 'RoadName', key: 'RoadName' },
  { title: '自然村名称', dataIndex: 'ViligeName', key: 'ViligeName' },
  { title: '数量', dataIndex: 'MPCount', key: 'MPCount' },
  { title: '申办人', dataIndex: 'Applicant', key: 'Applicant' },
  { title: '联系电话', dataIndex: 'ApplicantPhone', key: 'ApplicantPhone' },
  { title: '编制日期', dataIndex: 'MPBZTime', key: 'MPBZTime' },
];

class PLMaking extends Component {
  state = {
    LXMPProduceComplete: 0,
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

  async search(condition) {
    let { PageNum, PageSize, LXMPProduceComplete } = this.state;
    let newCondition = { PageNum, PageSize, LXMPProduceComplete, ...condition };
    this.setState({ loading: true });
    await Post(url_GetPLMPProduce, newCondition, e => {
      this.setState({
        selectedRows: [],
        total: e.Count,
        rows: e.Data
          ? e.Data.map((item, index) => {
              item.index = index + 1;
              return item;
            })
          : [],
      });
    });
    this.setState({ loading: false });
  }

  making() {
    console.log(this.state.selectedRows);
  }

  onView(i) {
    console.log(i);
  }

  render() {
    var { LXMPProduceComplete, PageSize, PageNum, total, rows, selectedRows, loading } = this.state;
    return (
      <div className={st.PLMaking}>
        <div className={st.header}>
          <Radio.Group
            defaultValue={LXMPProduceComplete}
            buttonStyle="solid"
            onChange={e => {
              this.setState({
                LXMPProduceComplete: e.target.value,
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
          <Button type="primary" icon="form" disabled={!total} onClick={this.making.bind(this)}>
            制作
          </Button>
        </div>
        <div className={st.body}>
          <Table
            bordered
            rowSelection={
              LXMPProduceComplete
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
              LXMPProduceComplete
                ? columns.concat({
                    title: '操作',
                    key: 'operation',
                    render: i => {
                      return (
                        <div className={st.rowbtns}>
                          <Icon type="edit" title="下载汇总表" onClick={e => this.onView(e)} />
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
