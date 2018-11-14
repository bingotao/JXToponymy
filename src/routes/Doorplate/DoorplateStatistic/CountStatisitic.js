import { Component } from 'react';

import { Cascader, DatePicker, Button, Table } from 'antd';

import st from './CountStatisitic.less';

import { url_GetDistrictTreeFromDistrict, url_GetMPBusinessNumTJ } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistricts } from '../../../utils/utils.js';

import { getMPBusinessNumTJ } from '../../../services/MPStatistic';

class CountStatisitic extends Component {
  state = {
    loading: false,
    rows: [],
    districts: [],
  };

  condition = {
    pageSize: 1000,
    pageNum: 1,
  };

  columns = [
    { title: '序号', align: 'center', width: 80, dataIndex: 'index', key: 'index' },
    { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    { title: '镇街道', align: 'center', dataIndex: 'NeighborhoodsName', key: 'NeighborhoodsName' },
    { title: '打印门牌证', align: 'center', dataIndex: 'MPZ', key: 'MPZ' },
    { title: '开具地名证明', align: 'center', dataIndex: 'DMZM', key: 'DMZM' },
    { title: '总数量', align: 'center', dataIndex: 'Total', key: 'Total' },
  ];

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  async search() {
    await getMPBusinessNumTJ(this.condition, e => {
      if (e && e.Data) {
        e.Data.map((item, idx) => (item.index = idx + 1));
        this.setState({ rows: e.Data });
      }
    });
  }

  componentDidMount() {
    this.getDistricts();
  }

  render() {
    let { loading, rows, districts } = this.state;
    return (
      <div className={st.CountStatisitic}>
        <div className={st.condition}>
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
          <DatePicker
            onChange={e => {
              this.condition.start = e && e.format('YYYY-MM-DD');
            }}
            placeholder="办理时间（起）"
            style={{ width: '150px' }}
          />
          &ensp;~ &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e && e.format('YYYY-MM-DD');
            }}
            placeholder="办理时间（止）"
            style={{ width: '150px' }}
          />
          &emsp;
          <Button type="primary" icon="pie-chart" onClick={this.search.bind(this)}>
            统计
          </Button>
        </div>
        <div className={st.result}>
          <Table
            loading={loading}
            bordered
            columns={this.columns}
            dataSource={rows}
            pagination={false}
          />
        </div>
      </div>
    );
  }
}

export default CountStatisitic;
