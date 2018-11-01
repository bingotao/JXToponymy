import { Component } from 'react';
import { Button, Table, Cascader, DatePicker, Select } from 'antd';
import st from './GPCount.less';

import { url_GetRPBZDataFromData, url_GetDistrictTreeFromDistrict } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistricts } from '../../../utils/utils.js';

import { getNamesFromDic, getRoadNamesFromData } from '../../../services/Common';
import { getRPNumTJ } from '../../../services/RPStatistic';

class GPCount extends Component {
  state = {
    loading: false,
    total: 0,
    rows: [],
    districts: [],
    communities: [],
    roads: [],
    Intersection: [],
    Direction: [],
    Manufacturers: [],
    Model: [],
    Material: [],
    Size: [],
    RoadName: undefined,
    CommunityName: undefined,
  };

  condition = {
    pageNum: 1,
    pageSize: 1000,
  };

  columns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    {
      title: '镇（街道）',
      align: 'center',
      dataIndex: 'NeighborhoodsName',
      key: 'NeighborhoodsName',
    },
    { title: '村社区', align: 'center', dataIndex: 'CommunityName', key: 'CommunityName' },
    { title: '道路名称', align: 'center', dataIndex: 'RoadName', key: 'RoadName' },
    { title: '样式', align: 'center', dataIndex: 'Model', key: 'Model' },
    { title: '材质', align: 'center', dataIndex: 'Material', key: 'Material' },
    { title: '规格', align: 'center', dataIndex: 'Size', key: 'Size' },
    { title: '数量', align: 'center', dataIndex: 'Count', key: 'Count' },
  ];

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  async getInitData() {
    await Post(url_GetRPBZDataFromData, null, d => {
      this.setState({ ...d });
    });
  }

  async getCommunities(e) {
    await getNamesFromDic({ type: 4, NeighborhoodsID: e }, e => {
      this.setState({ communities: e });
    });
  }

  async getRoads(e) {
    await getRoadNamesFromData({ type: 5, NeighborhoodsID: e }, e => {
      this.setState({ roads: e });
    });
  }

  async query() {
    let { pageSize, pageNum } = this.state;
    let newCondition = {
      ...this.condition,
      pageSize,
      pageNum,
    };
    console.log(newCondition);
    this.setState({ loading: true });
    await getRPNumTJ(this.condition, e => {
      let { pageNum, pageSize } = this.state;
      let { Count, Data } = e;
      this.setState({
        total: Count,
        rows: Data.map((item, idx) => {
          item.index = idx + 1;
          return item;
        }),
      });
    });
    this.setState({ loading: false });
  }

  componentDidMount() {
    this.getDistricts();
    this.getInitData();
  }

  render() {
    let {
      districts,
      loading,
      rows,
      communities,
      roads,
      Intersection,
      Direction,
      Manufacturers,
      Model,
      Material,
      Size,
      RoadName,
      CommunityName,
    } = this.state;
    return (
      <div className={st.GPCount}>
        <div className={st.condition}>
          <Cascader
            allowClear
            expandTrigger="hover"
            options={districts}
            placeholder="行政区"
            style={{ width: '200px' }}
            changeOnSelect
            onChange={(a, b) => {
              let v = a && a.length ? a[a.length - 1] : null;
              this.condition.DistrictID = v;
              this.condition.RoadName = null;
              this.condition.CommunityName = null;
              this.setState({
                RoadName: undefined,
                CommunityName: undefined,
                communities: [],
                roads: [],
              });

              if (v) {
                this.getCommunities(a[1]);
                this.getRoads(a[1]);
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
            allowClear
            onChange={e => {
              this.condition.RoadName = e;
              this.setState({ RoadName: e });
            }}
            placeholder="道路名称"
            showSearch
            style={{ width: '150px' }}
            value={RoadName}
          >
            {(roads || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <Select
            allowClear
            onChange={e => {
              this.condition.Model = e;
            }}
            placeholder="样式"
            showSearch
            style={{ width: '150px' }}
          >
            {(Model || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <Select
            allowClear
            onChange={e => {
              this.condition.Material = e;
            }}
            placeholder="材质"
            style={{ width: '150px' }}
          >
            {(Material || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <Select
            allowClear
            onChange={e => {
              this.condition.Size = e;
            }}
            placeholder="规格"
            style={{ width: '150px' }}
          >
            {(Size || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <DatePicker
            onChange={e => {
              this.condition.start = e && e.toISOString();
            }}
            placeholder="设置时间（起）"
            style={{ width: '150px' }}
          />
          &ensp;~ &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e && e.toISOString();
            }}
            placeholder="设置时间（止）"
            style={{ width: '150px' }}
          />
          &emsp;
          <Button type="primary" icon="pie-chart" onClick={this.query.bind(this)}>
            统计
          </Button>
        </div>
        <div className={st.result}>
          <Table
            loading={loading}
            pagination={false}
            bordered
            columns={this.columns}
            dataSource={rows}
          />
        </div>
      </div>
    );
  }
}

export default GPCount;
