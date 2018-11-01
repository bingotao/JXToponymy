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
import { getMPProduceTJ } from '../../../services/MPStatistic';
import { getNamesFromDic } from '../../../services/Common';

class AreaStatistic extends Component {
  state = {
    CommunityName: undefined,
    districts: [],
    loading: false,
    rows: [],
    communities: [],
  };

  condition = {
    pageSize: 1000,
    pageNum: 1,
  };

  columns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    { title: '镇街道', align: 'center', dataIndex: 'NeighborhoodsName', key: 'NeighborhoodsName' },
    { title: '村社区', align: 'center', dataIndex: 'CommunityName', key: 'CommunityName' },
    { title: '大门牌', align: 'center', dataIndex: 'DMP', key: 'DMP' },
    { title: '小门牌', align: 'center', dataIndex: 'XMP', key: 'XMP' },
    { title: '楼（幢）牌', align: 'center', dataIndex: 'LZP', key: 'LZP' },
    { title: '单元牌', align: 'center', dataIndex: 'DYP', key: 'DYP' },
    { title: '农村门牌', align: 'center', dataIndex: 'NCP', key: 'NCP' },
    { title: '户室牌', align: 'center', dataIndex: 'HSP', key: 'HSP' },
    { title: '总量', align: 'center', dataIndex: 'Sum', key: 'Sum' },
  ];

  refreshChart() {
    let { rows } = this.state;
    if (!this.chart) this.chart = echarts.init(this.chartDom);

    let option = {
      title: {
        text: '',
        subtext: '',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a}:{c}',
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: '50%',
          center: ['50%', '50%'],
          data: rows.map(i => {
            return { name: i.CommunityName, value: i.Sum };
          }),
        },
      ],
    };

    this.chart.setOption(option);
  }

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  async getCommunities(e) {
    this.setState({ CommunityName: undefined, communities: [] });
    this.condition.CommunityName = null;

    if (e && e[1]) {
      await getNamesFromDic({ type: 4, NeighborhoodsID: e[1] }, e => {
        this.setState({ communities: e });
      });
    }
  }

  async search() {
    this.setState({ loading: true });
    await getMPProduceTJ(this.condition, e => {
      let data = e.Data;
      data.map((item, idx) => (item.index = idx + 1));
      this.setState({ rows: data }, this.refreshChart.bind(this));
    });
    this.setState({ loading: false });
  }

  componentDidMount() {
    this.getDistricts();
  }

  render() {
    let { districts, communities, rows, loading, CommunityName } = this.state;
    return (
      <div className={st.AreaStatistic}>
        <div>
          <Cascader
            allowClear
            expandTrigger="hover"
            placeholder="行政区"
            style={{ width: '200px' }}
            options={districts}
            changeOnSelect
            onChange={e => {
              let district = e && e.length ? e[e.length - 1] : null;
              this.condition.DistrictID = district;
              if (district) this.getCommunities(e);
            }}
          />
          &emsp;
          <Select
            placeholder="村社区"
            style={{ width: 150 }}
            allowClear
            value={CommunityName}
            onChange={e => {
              this.condition.CommunityName = e;
              this.setState({ CommunityName: e });
            }}
          >
            {(communities || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &emsp;
          <DatePicker
            onChange={e => {
              this.condition.start = e && e.toISOString();
            }}
            placeholder="办理时间（起）"
            style={{ width: '150px' }}
          />
          &ensp;~ &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e && e.toISOString();
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
              <div ref={e => (this.chartDom = e)} className={st.chartcontent} />
            </div>
          </div>
          <div className={st.rows}>
            <div className={st.title}>业务办理详情</div>
            <div className={st.rowsbody}>
              <Table
                bordered
                columns={this.columns}
                dataSource={rows}
                loading={loading}
                pagination={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AreaStatistic;
