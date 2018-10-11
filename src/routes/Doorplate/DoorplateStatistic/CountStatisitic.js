import { Component } from 'react';

import { Cascader, DatePicker, Button, Table } from 'antd';

import st from './CountStatisitic.less';

import { url_GetDistrictTreeFromDistrict, url_GetMPBusinessNumTJ } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistricts } from '../../../utils/utils.js';

class CountStatisitic extends Component {
  state = {
    loading: false,
    rows: [],
    districts: [],
  };

  condition = {};

  columns = [
    { title: '序号', width: 80, dataIndex: 'index', key: 'index' },
    { title: '市辖区', dataIndex: 'index', key: 'index' },
    { title: '镇街道', dataIndex: 'index', key: 'index' },
    { title: '办理类型', dataIndex: 'index', key: 'index' },
    { title: '数量', dataIndex: 'index', key: 'index' },
  ];

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  async search() {
    await Post(url_GetMPBusinessNumTJ, this.condition, e => {
      console.log(e);
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
            allowClear
            options={districts}
            onChange={e => {
              this.condition.DistrictID = e || e[1];
            }}
          />
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
        <div className={st.result}>
          <Table bordered columns={this.columns} data={rows} />
        </div>
      </div>
    );
  }
}

export default CountStatisitic;
