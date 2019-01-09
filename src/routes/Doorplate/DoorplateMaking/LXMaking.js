import React, { Component } from 'react';
import { Radio, Button, Pagination, Table, Icon, Select } from 'antd';

import st from './LXMaking.less';

import { getProducedLXMP, getNotProducedLXMP } from '../../../services/MPMaking';
import { GetProducedLXMPDetails, ProduceLXMP } from '../../../services/MPMaking';
import { error } from '../../../utils/notification';

class LXMaking extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  yzzColumns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '批次号', align: 'center', dataIndex: 'LXProduceID', key: 'LXProduceID' },
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
    GetProducedLXMPDetails(i.LXProduceID);
  }

  state = {
    PageNum: 1,
    PageSize: 25,
    MPType: '道路门牌',
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

  async search() {
    let { PageNum, PageSize, LXMPProduceComplete, MPType } = this.state;
    this.setState({ loading: true });
    if (LXMPProduceComplete === 0) {
      await getNotProducedLXMP({ PageNum, PageSize, MPType }, e => {
        let { Count, Data } = e;
        let { PageSize, PageNum } = this.state;
        this.MPType = MPType;
        this.setState({
          total: Count,
          selectedRows: [],
          rows: Data.map((item, idx) => {
            // item.key = item.MPID;
            item.index = (PageNum - 1) * PageSize + idx + 1;
            return item;
          }),
        });
      });
    } else {
      await getProducedLXMP({ PageNum, PageSize, MPType }, e => {
        let { Count, Data } = e;
        let { PageSize, PageNum } = this.state;
        this.MPType = MPType;
        this.setState({
          selectedRows: [],
          total: Count,
          rows: Data.map((item, idx) => {
            item.index = (PageNum - 1) * PageSize + idx + 1;
            return item;
          }),
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
          ids.push(rows[i].MPID);
        }
        console.log(ids);
        // ProduceLXMP({ MPIDs: ids, MPType: this.MPType }, e => {
        //   this.search();
        // });
      }
    } else {
      error('请选择要制作的门牌！');
    }
  }

  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }

  render() {
    let {
      LXMPProduceComplete,
      MPType,
      rows,
      total,
      PageNum,
      PageSize,
      loading,
      selectedRows,
    } = this.state;
    let columns = LXMPProduceComplete == 1 ? this.yzzColumns : this.wzzColumns;
    let rowSelection =
      LXMPProduceComplete == 1
        ? false
        : {
            selectedRowKeys: selectedRows,
            onChange: e => {
              console.log(e);
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
          <Select
            value={MPType}
            style={{ width: 120 }}
            onChange={e => {
              this.setState({ MPType: e });
            }}
          >
            {/* <Select.Option value="住宅门牌">住宅门牌</Select.Option> */}
            <Select.Option value="道路门牌">道路门牌</Select.Option>
            <Select.Option value="农村门牌">农村门牌</Select.Option>
          </Select>
          &emsp;
          <Button type="primary" icon="search" onClick={e => this.search({ PageNum: 1 })}>
            搜索
          </Button>
          &emsp;
          {this.getEditComponent(
            LXMPProduceComplete === 0 && (
              <Button type="primary" icon="form" disabled={!total} onClick={this.making.bind(this)}>
                制作
              </Button>
            )
          )}
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
