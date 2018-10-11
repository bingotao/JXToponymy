import React, { Component } from 'react';
import { Select, DatePicker, Cascader, Button, Table, Pagination } from 'antd';
import st from './AreaStatistic.less';
import {
  url_GetDistrictTreeFromDistrict,
  url_GetCommunityNamesFromData,
  url_GetMPProduceTJ,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistricts } from '../../../utils/utils.js';

class AreaStatistic extends Component {
  state = {
    districts: [],
    loading: false,
    rows: [],
    communities: [],
  };

  condition = {};

  columns = [
    { title: '序号', dataIndex: 'index', key: 'index' },
    { title: '市辖区', dataIndex: 'index', key: 'index' },
    { title: '镇街道', dataIndex: 'index', key: 'index' },
    { title: '村社区', dataIndex: 'index', key: 'index' },
    { title: '大门牌', dataIndex: 'index', key: 'index' },
    { title: '小门牌', dataIndex: 'index', key: 'index' },
    { title: '楼（幢）牌', dataIndex: 'index', key: 'index' },
    { title: '单元牌', dataIndex: 'index', key: 'index' },
    { title: '农村门牌', dataIndex: 'index', key: 'index' },
    { title: '户室牌', dataIndex: 'index', key: 'index' },
    { title: '总量', dataIndex: 'index', key: 'index' },
  ];

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  async search() {
    await Post(url_GetMPProduceTJ, this.condition, e => {
      console.log(e);
    });
  }

  componentDidMount() {
    this.getDistricts();
  }

  render() {
    let { districts, communities, rows, loading } = this.state;
    return (
      <div className={st.AreaStatistic}>
        <div>
          <Cascader
            allowClear
            expandTrigger="hover"
            placeholder="行政区"
            style={{ width: '200px' }}
            allowClear
            options={districts}
            onChange={e => {
              this.condition.DistrictID = e && e[1];
            }}
          />
          &emsp;
          <Select
            placeholder="村社区"
            style={{ width: 150 }}
            allowclear
            onChange={e => {
              this.conditon.CommunityName = e;
            }}
          >
            {(communities || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <DatePicker
            onChange={e => {
              this.condition.start = e;
            }}
            placeholder="办理时间（起）"
            style={{ width: '150px' }}
          />
          &ensp;~ &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e;
            }}
            placeholder="办理时间（止）"
            style={{ width: '150px' }}
          />
          &emsp;
          <Button type="primary" icon="pie-chart" onClick={this.search.bind(this)}>
            统计
          </Button>
        </div>
        <div className={st.body}>
          <div className={st.statistic}>
            <div className={st.chart}>
              <div className={st.title}>统计图</div>
              <div ref={e => (this.chart = e)} className={st.chartcontent} />
            </div>
          </div>
          <div className={st.rows}>
            <div className={st.title}>业务办理详情</div>
            <div className={st.rowsbody}>
              <Table bordered columns={this.columns} dataSource={rows} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AreaStatistic;
