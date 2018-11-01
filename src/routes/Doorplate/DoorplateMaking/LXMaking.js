import React, { Component } from 'react';
import { Radio, Button, Pagination, Table, Icon } from 'antd';

import st from './LXMaking.less';
import { Post } from '../../../utils/request.js';

import {}from '../../../services/MPMaking';

class LXMaking extends Component {
  yzzColumns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '批次号', dataIndex: 'name', key: 'name' },
    { title: '制作时间', dataIndex: 'age', key: 'age' },
    { title: '制作人', dataIndex: 'address', key: '1' },
    {
      title: '操作',
      key: 'operation',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="查看汇总表" onClick={e => this.onView(i)} />
          </div>
        );
      },
    },
  ];

  wzzColumns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    { title: '镇街道', align: 'center', dataIndex: 'NeighborhoodsName', key: 'NeighborhoodsName' },
    { title: '村社区', align: 'center', dataIndex: 'CommunityName', key: 'CommunityName' },
    { title: '标准地名', align: 'center', dataIndex: 'PlaceName', key: 'PlaceName' },
    { title: '门牌号', align: 'center', dataIndex: 'MPNumber', key: 'MPNumber' },
    { title: '门牌规格', align: 'center', dataIndex: 'MPSize', key: 'MPSize' },
    { title: '邮政编码', align: 'center', dataIndex: 'Postcode', key: 'Postcode' },
    { title: '编制日期', align: 'center', dataIndex: 'MPBZTime', key: 'MPBZTime' },
  ];

  onView(i) {
    console.log(i);
  }

  state = {
    PageNum: 1,
    PageSize: 25,
    LXMPProduceComplete: 0,
    total: 0,
    rows: [],
    selectedRows: [],
    loading: false,
  };

  onShowSizeChange(pn, ps) {
    let obj = {};
    if (pn) obj.PageNum = pn;
    if (ps) obj.PageSize = ps;
    this.setState(obj, e => this.search());
  }

  async search(condition) {
    let { PageNum, PageSize, LXMPProduceComplete } = this.state;
    let newCondition = { PageNum, PageSize, LXMPProduceComplete, ...condition };
    this.setState({ loading: true });
    await Post(url_GetLXMPProduce, newCondition, e => {
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

  render() {
    let { LXMPProduceComplete, rows, total, PageNum, PageSize, loading, selectedRows } = this.state;
    let columns = LXMPProduceComplete == 1 ? this.yzzColumns : this.wzzColumns;
    let rowSelection =
      LXMPProduceComplete == 1
        ? false
        : {
            selectedRowKeys: selectedRows,
            onChange: e => {
              this.setState({ selectedRows: e });
            },
          };

    return (
      <div className={st.LXMaking}>
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
            rowSelection={rowSelection}
            pagination={false}
            columns={columns}
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

export default LXMaking;
