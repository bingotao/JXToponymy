import React, { Component } from 'react';
import { DataGrid, GridColumn } from 'rc-easyui';
import { Select, DatePicker, Cascader, Button, Table, Pagination, Spin } from 'antd';
import st from './AreaStatistic.less';
import {
  url_GetDistrictTreeFromDistrict,
  url_ExportMPProduceTJ,
  url_GetCommunityNamesFromData,
  url_GetMPProduceTJ,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistrictsWithJX } from '../../../utils/utils.js';
import { getMPProduceTJ,GetConditionOfMPProduceTJ } from '../../../services/MPStatistic';
import { getNamesFromDic } from '../../../services/Common';

class AreaStatistic extends Component {
  state = {
    CommunityName: undefined,
    districts: [],
    loading: false,
    rows: [],
    communities: [],
    sum: 0,
    dmpTotal: 0,
    xmpTotal: 0,
    lzpTotal: 0,
    dypTotal: 0,
    hspTotal: 0,
    ncpTotal: 0,
  };

  condition = {
    pageSize: 1000,
    pageNum: 1,
  };

  columns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '行政区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    { title: '镇街道', align: 'center', dataIndex: 'NeighborhoodsName', key: 'NeighborhoodsName' },
    { title: '村社区', align: 'center', dataIndex: 'CommunityName', key: 'CommunityName' },
    { title: '大门牌', align: 'center', dataIndex: 'DMP', key: 'DMP' },
    { title: '小门牌', align: 'center', dataIndex: 'XMP', key: 'XMP' },
    { title: '楼（幢）牌', align: 'center', dataIndex: 'LZP', key: 'LZP' },
    { title: '单元牌', align: 'center', dataIndex: 'DYP', key: 'DYP' },
    { title: '户室牌', align: 'center', dataIndex: 'HSP', key: 'HSP' },
    { title: '农村门牌', align: 'center', dataIndex: 'NCP', key: 'NCP' },
    { title: '总数量', align: 'center', dataIndex: 'Sum', key: 'Sum' },
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
      let districts = getDistrictsWithJX(e);
      this.setState({ districts: districts });
    });
  }

  async getCommunities(e) {
    this.setState({ CommunityName: undefined, communities: [] });
    this.condition.CommunityName = null;

    if (e) {
      await getNamesFromDic({ type: 4, DistrictID: e[e.length-1] }, e => {
        this.setState({ communities: e });
      });
    }
  }

  async search() {
    this.setState({ loading: true });
    await getMPProduceTJ(this.condition, e => {
      let { Data, TotalCount, dmpTotal, xmpTotal, lzpTotal, dypTotal, hspTotal, ncpTotal } = e;
      Data.map((item, idx) => (item.index = idx + 1));
      this.setState(
        { rows: Data, sum: TotalCount, dmpTotal, xmpTotal, lzpTotal, dypTotal, hspTotal, ncpTotal }
        // this.refreshChart.bind(this)
      );
    });
    this.setState({ loading: false });
  }

  async onExport() {
    await GetConditionOfMPProduceTJ(this.condition, e => {
      window.open(url_ExportMPProduceTJ, '_blank');
    });
  }

  componentDidMount() {
    this.getDistricts();
  }

  render() {
    let {
      districts,
      communities,
      rows,
      loading,
      CommunityName,
      sum,
      dmpTotal,
      xmpTotal,
      lzpTotal,
      dypTotal,
      hspTotal,
      ncpTotal,
    } = this.state;
    let { edit } = this.props;
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
            value={CommunityName || undefined}
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
          &emsp;
          {edit ? (
            <Button
              disabled={!(rows && rows.length)}
              type="primary"
              icon="export"
              onClick={this.onExport.bind(this)}
            >
              导出
            </Button>
          ) : null}
        </div>
        <div className={st.body}>
          {/*
            <div className={st.statistic}>
              <div className={st.chart}>
                <div className={st.title}>统计图</div>
                <div ref={e => (this.chartDom = e)} className={st.chartcontent} />
              </div>
            </div>
          */}
          <div className={st.rows}>
            {/*<div className={st.title}>业务办理详情</div>*/}
            <div className={st.rowsbody}>
              {loading ? (
                <div className={st.loading}>
                  <Spin {...loading} />
                </div>
              ) : null}
              <DataGrid data={rows} style={{ height: '100%' }}>
                <GridColumn field="index" title="序号" align="center" width={60} />
                <GridColumn field="CountyName" title="行政区" align="center" width={100} />
                <GridColumn field="NeighborhoodsName" title="镇街道" align="center" width={100} />
                <GridColumn field="CommunityName" title="村社区" align="center" width={100} />
                <GridColumn field="DMP" title="大门牌" align="center" width={80} />
                <GridColumn field="XMP" title="小门牌" align="center" width={80} />
                <GridColumn field="LZP" title="楼幢牌" align="center" width={80} />
                <GridColumn field="DYP" title="单元牌" align="center" width={80} />
                <GridColumn field="HSP" title="户室牌" align="center" width={80} />
                <GridColumn field="NCP" title="农村牌" align="center" width={80} />
                <GridColumn field="Sum" title="合计" align="center" width={80} />
              </DataGrid>
              {/* <Table
                bordered
                columns={this.columns}
                dataSource={rows}
                loading={loading}
                pagination={false}
              /> */}
            </div>
            <div className={st.rowsfooter}>
              共计门牌：<span>{sum}</span>个，其中大门牌<span>{dmpTotal}</span>个，小门牌<span>
                {xmpTotal}
              </span>个，楼幢牌<span>{lzpTotal}</span>个，单元牌<span>{dypTotal}</span>个，户室牌<span
              >
                {hspTotal}
              </span>个，农村牌<span>{ncpTotal}</span>个
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AreaStatistic;
