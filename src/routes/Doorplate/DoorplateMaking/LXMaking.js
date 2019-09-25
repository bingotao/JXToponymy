import React, { Component } from 'react';
import { Radio, Button, Pagination, Table, Icon, Select, Cascader, Input, DatePicker } from 'antd';

import st from './LXMaking.less';

import { getProducedLXMP, getNotProducedLXMP } from '../../../services/MPMaking';
import { GetProducedLXMPDetails, ProduceLXMP } from '../../../services/MPMaking';
import { getDistrictsWithJX } from '../../../utils/utils.js';
import { url_GetDistrictTreeFromDistrict } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';

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
    { title: '行政区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    { title: '镇街道', align: 'center', dataIndex: 'NeighborhoodsName', key: 'NeighborhoodsName' },
    { title: '村社区', align: 'center', dataIndex: 'CommunityName', key: 'CommunityName' },
    { title: '标准地名', align: 'center', dataIndex: 'PlaceName', key: 'PlaceName' },
    { title: '门牌号码', align: 'center', dataIndex: 'MPNumber', key: 'MPNumber' },
    { title: '门牌规格', align: 'center', dataIndex: 'MPSize', key: 'MPSize' },
    { title: '邮政编码', align: 'center', dataIndex: 'Postcode', key: 'Postcode' },
    { title: '编制日期', align: 'center', dataIndex: 'MPBZTime', key: 'MPBZTime' },
  ];

  expandedRowRender = (record, index, indent, expanded) => {
    let data = [];
    record.lxmps.map((item, idx) => {
      item.index = idx + 1;
      item.CountyName = item.CountyID.split('.')[1];
      item.NeighborhoodsName = item.NeighborhoodsID.split('.')[2];
      data.push(item);
    });
    return (
      <div className={st.childTab}>
        <Table columns={this.wzzColumns} dataSource={data} pagination={false} />
      </div>
    );
  };

  condition = {
    // PageNum: 1,
    // PageSize: 25,
    // LXMPProduceComplete: 0,
    MPType: '道路门牌',
  };

  onView(i) {
    GetProducedLXMPDetails(i.LXProduceID);
  }

  state = {
    PageNum: 1,
    PageSize: 25,
    // MPType: '道路门牌',
    LXMPProduceComplete: 0,
    total: 0,
    rows: [],
    selectedRows: [],
    loading: false,
    districts: [],
  };
  componentDidMount() {
    this.getDistricts();
    this.search();
  }

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistrictsWithJX(e);
      this.setState({ districts: districts });
    });
  }

  onShowSizeChange(pn, ps) {
    let obj = {};
    if (pn) obj.PageNum = pn;
    if (ps) obj.PageSize = ps;
    this.setState(obj, e => this.search());
  }

  async search(pageSize, pageNum) {
    let { PageSize, PageNum, LXMPProduceComplete } = this.state;
    PageNum = pageNum || PageNum;
    PageSize = pageSize || PageSize;

    let newCondition = {
      ...this.condition,
      PageSize: PageSize,
      PageNum: PageNum,
    };

    this.setState({ loading: true });
    if (LXMPProduceComplete === 0) {
      await getNotProducedLXMP(newCondition, e => {
        let { Count, Data } = e;
        this.setState({
          total: Count,
          selectedRows: [],
          rows: Data.map((item, idx) => {
            item.key = item.MPID;
            item.index = (PageNum - 1) * PageSize + idx + 1;
            return item;
          }),
        });
      });
    } else {
      await getProducedLXMP(newCondition, e => {
        let { Count, Data } = e;
        // let { PageSize, PageNum } = this.state;
        // this.MPType = MPType;

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
      if (!this.condition.MPType) {
        error('请选择门牌类型！');
      } else {
        let ids = [];
        let { rows } = this.state;
        for (let i of selectedRows) {
          // debugger
          // ids.push(rows[i].MPID);
          ids.push(i);
        }
        console.log(ids);
        ProduceLXMP({ MPIDs: ids, MPType: this.condition.MPType }, e => {
          this.search();
        });
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
      // MPType,
      rows,
      total,
      PageNum,
      PageSize,
      loading,
      selectedRows,
      districts,
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
          <Cascader
            allowClear
            expandTrigger="hover"
            placeholder="行政区"
            style={{ width: '200px' }}
            changeOnSelect
            options={districts}
            onChange={e => {
              this.condition.DistrictID = e && e.length ? e[e.length - 1] : undefined;
            }}
          />
          &emsp;
          <Select
            placeholder="门牌规格"
            style={{ width: 100 }}
            allowClear
            onChange={e => {
              this.condition.MPSize = e;
              // this.setState({ MPType: e });
            }}
          >
            {['60*40CM', '40*30CM', '30*20CM', '21*15CM', '15*10CM'].map(e => (
              <Select.Option value={e}>{e}</Select.Option>
            ))}
          </Select>
          &emsp;
          <Select
            defaultValue={this.condition.MPType}
            style={{ width: 100 }}
            onChange={e => {
              this.condition.MPType = e;
              // this.setState({ MPSize: e });
            }}
          >
            {['道路门牌', '农村门牌'].map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <Select
            defaultValue={LXMPProduceComplete}
            style={{ width: 90 }}
            onChange={e => {
              if (LXMPProduceComplete !== e) {
                this.setState({
                  LXMPProduceComplete: e,
                  total: 0,
                  rows: [],
                  selectedRows: [],
                  PageNum: 1,
                });
              }
            }}
          >
            <Select.Option value={0}>未制作</Select.Option>
            <Select.Option value={1}>已制作</Select.Option>
          </Select>
          &emsp;
          <Input
            placeholder="标准地名"
            style={{ width: '160px' }}
            onChange={e => (this.condition.Name = e.target.value)}
            allowClear={true}
          />
          &emsp;
          <DatePicker
            onChange={e => {
              this.condition.start = e && e.format('YYYY-MM-DD');
            }}
            placeholder={LXMPProduceComplete === 0 ? '编制日期（起）' : '制作日期（起）'}
            style={{ width: '150px' }}
          />
          &ensp;~ &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e && e.format('YYYY-MM-DD');
            }}
            placeholder={LXMPProduceComplete === 0 ? '编制日期（止）' : '制作日期（止）'}
            style={{ width: '150px' }}
          />
          &emsp;
          {/*
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
          &emsp;*/}
          <Button type="primary" icon="search" onClick={e => this.search(undefined, 1)}>
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
            expandedRowRender={
              LXMPProduceComplete === 0
                ? null
                : (record, index, indent, expanded) =>
                    this.expandedRowRender(record, index, indent, expanded)
            }
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
