import { Component } from 'react';
import { Button, Table, Cascader, DatePicker, Select, Spin } from 'antd';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';
import st from './GPCount.less';

import { url_GetRPBZDataFromData, url_GetDistrictTreeFromDistrict } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistricts } from '../../../utils/utils.js';

import {
  getCommunityNamesFromData,
  getModelFromData,
  getManufacturerFromData,
  getRoadNamesFromData,
} from '../../../services/Common';
import { getRPNumTJ } from '../../../services/RPStatistic';

class GPCount extends Component {
  state = {
    clearCondition: false,
    loading: false,
    total: 0,
    sum: 0,
    rows: [],
    districts: [],
    communities: [],
    roads: [],
    Intersection: [],
    Direction: [],
    Manufacturers: [],
    Manufacturer: undefined,
    models: [],
    Model: undefined,
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
    { title: '行政区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    {
      title: '镇街道',
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
    await getCommunityNamesFromData({ type: 5, DistrictID: e }, e => {
      this.setState({ communities: e });
    });
  }

  async getRoads(CountyID, NeighborhoodsID, CommunityName) {
    await getRoadNamesFromData({ type: 5, CountyID, NeighborhoodsID, CommunityName }, e => {
      this.setState({ roads: e });
    });
  }

  async getModelFromData(DistrictID, CommunityName, RoadName) {
    await getModelFromData({ DistrictID, CommunityName, RoadName }, e => {
      this.setState({ models: e });
    });
  }

  async getManufacturerFromData(DistrictID, CommunityName, RoadName, Model) {
    await getManufacturerFromData({ DistrictID, CommunityName, RoadName, Model }, e => {
      this.setState({ Manufacturers: e });
    });
  }

  async query() {
    let { pageSize, pageNum } = this.state;
    let newCondition = {
      ...this.condition,
      pageSize,
      pageNum,
    };

    this.setState({ loading: true });
    await getRPNumTJ(this.condition, e => {
      let { pageNum, pageSize } = this.state;
      let { Count, Data, TotalCount } = e;
      this.setState({
        sum: TotalCount,
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
    this.query();
  }

  render() {
    let {
      clearCondition,
      districts,
      loading,
      rows,
      sum,
      communities,
      roads,
      Intersection,
      Direction,
      Manufacturers,
      models,
      Model,
      Manufacturer,
      Material,
      Size,
      RoadName,
      CommunityName,
    } = this.state;
    return (
      <div className={st.GPCount}>
        {clearCondition ? null : (
          <div className={st.condition}>
            <Cascader
              allowClear
              expandTrigger="hover"
              options={districts}
              placeholder="行政区"
              style={{ width: '200px' }}
              changeOnSelect
              onChange={(a, b) => {
                let jd = a && a[1];
                let qx = a && a[0];

                let v = a && a.length ? a[a.length - 1] : null;
                this.condition.DistrictID = v;
                this.condition.RoadName = null;
                this.condition.CommunityName = null;
                this.setState({
                  RoadName: undefined,
                  CommunityName: undefined,
                  Model: undefined,
                  Manufacturer: undefined,
                  communities: [],
                  roads: [],
                  models: [],
                  Manufacturers: [],
                });

                if (v) {
                  this.getCommunities(v);
                  this.getRoads(qx, jd, null);
                  this.getModelFromData(v, null, null);
                  this.getManufacturerFromData(v, null, null, null);
                }
              }}
            />
            &emsp;
            <Select
              allowClear
              onChange={e => {
                this.condition.CommunityName = e;
                this.setState({
                  CommunityName: e,
                  RoadName: undefined,
                  Model: undefined,
                  Manufacturer: undefined,
                  roads: [],
                  models: [],
                  Manufacturers: [],
                });

                let did = this.condition.DistrictID.split('.');
                let qx = did && did.length >= 2 && did[0] + '.' + did[1];
                let jd = did && did.length == 3 ? this.condition.DistrictID : null;
                if (e) {
                  this.getRoads(qx, jd, e);
                  this.getModelFromData(this.condition.DistrictID, e, null);
                  this.getManufacturerFromData(this.condition.DistrictID, e, null, null);
                }
              }}
              placeholder="村社区"
              showSearch
              style={{ width: '150px' }}
              value={CommunityName || undefined}
            >
              {(communities || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &emsp;
            <Select
              allowClear
              onChange={e => {
                this.condition.RoadName = e;
                this.setState({
                  RoadName: e,
                  Model: undefined,
                  Manufacturer: undefined,
                  models: [],
                  Manufacturers: [],
                });
                if (e) {
                  this.getModelFromData(this.condition.DistrictID, this.condition.CommunityName, e);
                  this.getManufacturerFromData(
                    this.condition.DistrictID,
                    this.condition.CommunityName,
                    e,
                    null
                  );
                }
              }}
              placeholder="道路名称"
              showSearch
              style={{ width: '150px' }}
              value={RoadName || undefined}
            >
              {(roads || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &emsp;
            <Select
              allowClear
              onChange={e => {
                this.setState({
                  Model: e,
                  Manufacturer: undefined,
                  Manufacturers: [],
                });
                this.condition.Model = e;
                if (e)
                  this.getManufacturerFromData(
                    this.condition.DistrictID,
                    this.condition.CommunityName,
                    this.condition.RoadName,
                    e
                  );
              }}
              placeholder="样式"
              showSearch
              style={{ width: '150px' }}
              value={Model || undefined}
            >
              {(models || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &emsp;
            <Select
              allowClear
              onChange={e => {
                this.setState({
                  Manufacturer: e,
                  Manufacturers: [],
                });
                this.condition.Manufacturers = e;
              }}
              placeholder="生产厂家"
              style={{ width: '200px' }}
              value={Manufacturer || undefined}
            >
              {(Manufacturers || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &emsp;
            {/* <Select
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
          &emsp; */}
            <DatePicker
              onChange={e => {
                this.condition.start = e && e.format('YYYY-MM-DD');
              }}
              placeholder="设置时间（起）"
              style={{ width: '150px' }}
            />
            &ensp;~ &ensp;
            <DatePicker
              onChange={e => {
                this.condition.end = e && e.format('YYYY-MM-DD');
              }}
              placeholder="设置时间（止）"
              style={{ width: '150px' }}
            />
            &emsp;
            <Button type="primary" icon="pie-chart" onClick={this.query.bind(this)}>
              统计
            </Button>
            &emsp;
            <Button
              type="primary"
              icon="retweet"
              onClick={e => {
                this.condition = {};
                this.setState(
                  {
                    CommunityName: undefined,
                    RoadName: undefined,
                    communities: [],
                    roads: [],
                    clearCondition: true,
                  },
                  e => {
                    this.setState({ clearCondition: false });
                  }
                );
              }}
            >
              条件清空
            </Button>
          </div>
        )}
        <div className={st.result + ' ct-easyui-table'}>
          {loading ? (
            <div className={st.loading}>
              <Spin {...loading} />
            </div>
          ) : null}
          <DataGrid data={rows} style={{ height: '100%' }}>
            <GridColumn field="index" title="序号" align="center" width="100px" />
            <GridColumn field="CountyName" title="行政区" align="center" />
            <GridColumn field="NeighborhoodsName" title="镇街道" align="center" />
            <GridColumn field="CommunityName" title="村社区" align="center" />
            <GridColumn field="RoadName" title="道路名称" align="center" />
            <GridColumn field="Model" title="样式" align="center" />
            <GridColumn field="Material" title="材质" align="center" />
            <GridColumn field="Size" title="规格（MM）" align="center" />
            <GridColumn field="Count" title="数量" align="center" />
          </DataGrid>
        </div>
        <div className={st.footer}>
          共计路牌：<span>{sum}</span>个
        </div>
      </div>
    );
  }
}

export default GPCount;
