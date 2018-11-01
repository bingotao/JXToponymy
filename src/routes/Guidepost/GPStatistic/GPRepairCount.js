import { Component } from 'react';
import { Input, Icon, Button, Table, Cascader, DatePicker, Select, Pagination } from 'antd';
import st from './GPRepairCount.less';
import { whfs } from '../../../common/enums.js';

import {
  baseUrl,
  url_GetDistrictTreeFromDistrict,
  url_GetNamesFromDic,
} from '../../../common/urls.js';

import { getDistricts } from '../../../utils/utils.js';
import { Post } from '../../../utils/request';
import { getNamesFromDic } from '../../../services/Common';
import { getRPRepairTJ } from '../../../services/RPStatistic';

class GPRepairCount extends Component {
  state = {
    loading: false,
    rows: [],
    total: 0,
    pageSize: 25,
    pageNum: 1,
    districts: [],
    communities: [],
    RepairFactory: [],
    RepairParts: [],
    CommunityName: undefined,
  };

  condition = {};

  columns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    {
      title: '镇（街道）',
      align: 'center',
      dataIndex: 'NeighborhoodsName',
      key: 'NeighborhoodsName',
    },
    { title: '道路名称', align: 'center', dataIndex: 'RoadName', key: 'RoadName' },
    { title: '设置路口', align: 'center', dataIndex: 'Intersection', key: 'Intersection' },
    { title: '设置方向', align: 'center', dataIndex: 'Direction', key: 'Direction' },
    { title: '设置时间', align: 'center', dataIndex: 'BZTime', key: 'BZTime' },
    { title: '维修次数', align: 'center', dataIndex: 'address', key: '5' },
    {
      title: '操作',
      key: 'operation',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            <Icon type="tool" title="维护" onClick={e => this.onRepair(i)} />
            <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
          </div>
        );
      },
    },
  ];

  async getCommunities(e) {
    await getNamesFromDic({ type: 4, NeighborhoodsID: e }, e => {
      this.setState({ communities: e });
    });
  }

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  onShowSizeChange(pn, ps) {
    let page = {};
    if (pn) page.pageNum = pn;
    if (ps) page.pageSize = ps;
    this.setState(page, e => this.search(this.condition));
  }

  async search() {
    let { pageSize, pageNum } = this.state;
    let newCondition = {
      ...this.condition,
      pageSize,
      pageNum,
    };
    console.log(newCondition);
    await getRPRepairTJ(newCondition, e => {
      console.log(e);
    });
  }

  componentDidMount() {
    this.getDistricts();
  }

  render() {
    let {
      loading,
      rows,
      pageSize,
      total,
      pageNum,
      districts,
      communities,
      RepairParts,
      RepairFactory,
      CommunityName,
    } = this.state;
    return (
      <div className={st.GPRepairCount}>
        <div className={st.condition}>
          <Cascader
            allowClear
            expandTrigger="hover"
            options={districts}
            placeholder="行政区"
            style={{ width: '200px' }}
            onChange={(a, b) => {
              this.condition.DistrictID = a[1];
              this.condition.CommunityName = null;
              this.setState({ CommunityName: undefined, communities: [] });
              if (a && a.length) {
                this.getCommunities(a[1]);
              }
            }}
          />
          &emsp;
          <Select
            allowClear
            onChange={e => {
              this.condition.CommunityName = e;
              this.setState({ CommunityName: e });
            }}
            placeholder="村社区"
            showSearch
            style={{ width: '150px' }}
            value={CommunityName}
          >
            {(communities || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <Select
            onChange={e => {
              this.condition.RepairMode = e;
            }}
            placeholder="维护方式"
            showSearch
            style={{ width: '150px' }}
          >
            {(whfs || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <Input
            type="number"
            placeholder="维修次数"
            style={{ width: '100px' }}
            onChange={e => {
              this.condition.RepairCount = e.target.value;
            }}
          />
          &emsp;
          <Select
            onChange={e => {
              this.condition.RepairParts = e;
            }}
            placeholder="维修部位"
            showSearch
            style={{ width: '150px' }}
          >
            {(RepairParts || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <Input
            placeholder="维修内容"
            style={{ width: '150px' }}
            onChange={e => {
              this.condition.RepairContent = e.target.value;
            }}
          />
          &emsp;
          <Select
            onChange={e => {
              this.condition.RepairFactory = e;
            }}
            placeholder="维修厂家"
            style={{ width: '150px' }}
          >
            {(RepairFactory || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <DatePicker
            onChange={e => {
              this.condition.FinishTimeStart = e && e.toISOString();
            }}
            placeholder="修复时间（起）"
            style={{ width: '150px' }}
          />
          &ensp;~ &ensp;
          <DatePicker
            onChange={e => {
              this.condition.FinishTimeEnd = e && e.toISOString();
            }}
            placeholder="修复时间（止）"
            style={{ width: '150px' }}
          />
          &emsp;
          <Button
            type="primary"
            icon="pie-chart"
            onClick={e => {
              this.onShowSizeChange(1, null);
            }}
          >
            查询
          </Button>
        </div>
        <div className={st.result}>
          <Table loading={loading} pagination={false} bordered columns={this.columns} data={rows} />
        </div>
        <div className={st.footer}>
          <Pagination
            showSizeChanger
            onShowSizeChange={(page, size) => this.onShowSizeChange(1, size)}
            current={pageNum}
            pageSize={pageSize}
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

export default GPRepairCount;
