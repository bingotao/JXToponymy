import { Component } from 'react';
import { Table, Pagination, Radio, Button, Icon, Select, Modal } from 'antd';
import st from './PLMaking.less';
import {
  getProducedPLMP,
  getNotProducedPLMP,
  GetProducedPLMPDetails,
  ProducePLMP,
} from '../../../services/MPMaking';

class PLMaking extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  getContent(content) {
    let ctts = [];
    if (content) {
      ctts = content.split(';');
    }
    return (
      <div className={st.rows}>
        {ctts.map((i, idx) => (
          <div className={st.rowitem}>
            {idx + 1}、
            {i}
          </div>
        ))}
      </div>
    );
  }

  yzzColumns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '批次号', align: 'center', dataIndex: 'PLProduceID', key: 'PLProduceID' },
    { title: '制作时间', align: 'center', dataIndex: 'MPProduceTime', key: 'MPProduceTime' },
    { title: '制作人', align: 'center', dataIndex: 'MPProduceUser', key: 'MPProduceUser' },
    {
      title: '操作',
      key: 'operation',
      width: 80,
      align: 'center',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="download" title="清单下载" onClick={e => this.onView(i)} />
          </div>
        );
      },
    },
  ];

  wzzColumns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    {
      title: '申报信息',
      align: 'center',
      dataIndex: 'Content',
      key: 'Content',
      render: i => {
        return this.getContent(i);
      },
    },
  ];

  state = {
    PLMPProduceComplete: 0,
    MPType: '住宅门牌',
    PageSize: 25,
    PageNum: 1,
    total: 0,
    rows: [],
    selectedRows: [],
    loading: false,
    y: 0,
    showFooter: false,
  };

  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }

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
    let { PageNum, PageSize, PLMPProduceComplete, MPType } = this.state;
    this.setState({ loading: true });
    if (PLMPProduceComplete === 0) {
      await getNotProducedPLMP({ PageNum, PageSize, MPType }, e => {
        // let { Count, Data } = e;
        let { PageNum, PageSize } = this.state;
        this.MPType = MPType;
        e.map((item, idx) => {
          // item.key = item.PLID;
          item.index = (PageNum - 1) * PageSize + idx + 1;
        });
        this.setState({
          selectedRows: [],
          total: e.length,
          showFooter: false,
          rows: e,
        });
      });
    } else {
      await getProducedPLMP({ PageNum, PageSize, MPType }, e => {
        let { Count, Data } = e;
        let { PageNum, PageSize } = this.state;
        this.MPType = MPType;
        Data.map((item, idx) => {
          item.index = (PageNum - 1) * PageSize + idx + 1;
        });
        this.setState({
          selectedRows: [],
          rows: Data,
          total: Count,
          showFooter: true,
        });
      });
    }
    this.setState({ loading: false });
  }

  making() {
    let { selectedRows } = this.state;
    if (selectedRows && selectedRows.length) {
      if (!this.MPType) {
        error('请选择门牌类型！');
      } else {
        let ids = [];
        let { rows } = this.state;
        for (let i of selectedRows) {
          ids.push(rows[i].PLID);
        }
        console.log(ids);
        ProducePLMP({ PLIDs: ids, MPType: this.MPType }, e => {
          this.search();
        });
      }
    } else {
      error('请选择要制作的门牌！');
    }
  }

  onView(i) {
    GetProducedPLMPDetails(i.PLProduceID);
  }

  render() {
    var {
      MPType,
      PLMPProduceComplete,
      PageSize,
      PageNum,
      total,
      rows,
      selectedRows,
      loading,
      showFooter,
    } = this.state;

    let columns = PLMPProduceComplete == 1 ? this.yzzColumns : this.wzzColumns;
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
                showFooter: !!e.target.value,
              });
            }}
          >
            <Radio.Button value={0}>未制作</Radio.Button>
            <Radio.Button value={1}>已制作</Radio.Button>
          </Radio.Group>
          &emsp;
          <Select
            value={MPType}
            style={{ width: 120 }}
            onChange={e => {
              this.setState({ MPType: e });
            }}
          >
            <Select.Option value="住宅门牌">住宅门牌</Select.Option>
            <Select.Option value="道路门牌">道路门牌</Select.Option>
            <Select.Option value="农村门牌">农村门牌</Select.Option>
          </Select>
          &emsp;
          <Button type="primary" icon="search" onClick={e => this.search({ PageNum: 1 })}>
            搜索
          </Button>
          &emsp;
          {this.getEditComponent(
            PLMPProduceComplete === 0 && (
              <Button
                type="primary"
                icon="form"
                disabled={!selectedRows.length}
                onClick={this.making.bind(this)}
              >
                制作
              </Button>
            )
          )}
        </div>
        <div
          ref={e => {
            this.body = e;
          }}
          className={st.body}
        >
          <Table
            bordered
            rowSelection={
              PLMPProduceComplete
                ? false
                : {
                    selectedRowKeys: selectedRows,
                    onChange: e => {
                      console.log(e);
                      this.setState({ selectedRows: e });
                    },
                  }
            }
            pagination={false}
            columns={columns}
            dataSource={rows}
            loading={loading}
          />
        </div>
        {showFooter ? (
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
        ) : null}
      </div>
    );
  }
}

export default PLMaking;
