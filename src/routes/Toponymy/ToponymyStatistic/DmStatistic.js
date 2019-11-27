import React, { Component } from 'react';
import { DataGrid, GridColumn } from 'rc-easyui';
import { Select, DatePicker, Cascader, Button, Table, Pagination, Spin } from 'antd';
import st from './DmStatistic.less';
import { url_GetDistrictTreeFromDistrict, url_ExportBusinessTJ } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistrictsWithJX } from '../../../utils/utils.js';
import { GetDMBusinessTJ, GetConditionOfDMBusinessTJ } from '../../../services/MPStatistic';

class DmStatistic extends Component {
  state = {
    DMType: undefined,
    districts: [],
    // total: 0,
    PageSize: 10,
    PageNum: 1,
    loading: false,
    rows: [],
    communities: [],

    Count: 0,
    Sum: 0,
    GM: 0,
    HB: 0,
    MM: 0,
    XM: 0,
    YMM: 0,
  };

  condition = {
    PageSize: 10,
    PageNum: 1,
  };

  onShowSizeChange(pn, ps) {
    let page = {};
    if (pn) page.PageNum = pn;
    if (ps) page.PageSize = ps;
    this.setState(page);
    let condition = {
      ...this.condition,
      ...page,
    };
    this.search(condition);
  }

  async search(condition) {
    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    await GetDMBusinessTJ(condition, e => {
      let { PersonInfo, YMM, MM, GM, XM, HB, Count, Sum } = e;
      let { PageSize, PageNum } = this.state;
      PersonInfo.map((item, idx) => (item.index = idx + 1));
      this.setState(
        { rows: PersonInfo, Count: Count, YMM, MM, GM, XM, HB, Sum, }
      );
    });
    this.setState({ loading: false });
  }
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
            return { name: i.DMType, value: i.Sum };
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

  // 导出
  async onExport() {
    await GetConditionOfDMBusinessTJ(this.condition, e => {
      window.open(url_ExportBusinessTJ, '_blank');
    });
  }

  componentDidMount() {
    this.getDistricts();
  }

  render() {
    let {
      // total,
      rows,
      districts,
      PageSize,
      PageNum,
      loading,
      DMType,
      ItemType,
      YMM,
      MM,
      GM,
      XM,
      HB,
      Count,
      Sum,
    } = this.state;
    let { edit } = this.props;
    return (
      <div className={st.DmStatistic}>
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
            }}
          />
          &emsp;
          <Select
            allowClear
            placeholder="地名类别"
            style={{ width: 150 }}
            value={DMType || undefined}
            onChange={e => {
              this.condition.DMType = e;
              this.setState({ DMType: e });
            }}
          >
            <Select.Option value={'居民点'}>居民点</Select.Option>
            <Select.Option value={'建筑物'}>建筑物</Select.Option>
            <Select.Option value={'道路街巷'}>道路街巷</Select.Option>
            <Select.Option value={'桥梁'}>桥梁</Select.Option>
          </Select>
          &emsp;
          <Select
            allowClear
            style={{ width: 240 }}
            placeholder="业务类型"
            value={ItemType || undefined}
            onChange={e => {
              this.condition.ItemType = e;
              this.setState({
                ItemType: e,
              });
            }}
          >
            <Select.Option value={'YMM'}>住宅小区（楼）、建筑物预命名</Select.Option>
            <Select.Option value={'ZJMM'}>住宅小区（楼）、建筑物命名</Select.Option>
            <Select.Option value={'DLMM'}>
              新建道路（含街、巷、桥梁、
              <br />
              隧道、轨道交通线路）命名
            </Select.Option>
            <Select.Option value={'GM'}>住宅小区（楼）建筑物更名</Select.Option>
            <Select.Option value={'HB'}>申请换（补）发地名核准书</Select.Option>
            <Select.Option value={'ZX'}>注销</Select.Option>
          </Select>
          &emsp;
          <DatePicker
            onChange={e => {
              this.condition.start = e && e.format('YYYY-MM-DD');
            }}
            placeholder="批复时间（起）"
            style={{ width: '150px' }}
          />
          &ensp;~ &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e && e.format('YYYY-MM-DD');
            }}
            placeholder="批复时间（止）"
            style={{ width: '150px' }}
          />
          &emsp;
          <Button
            type="primary"
            icon="pie-chart"
            onClick={e => {
              this.onShowSizeChange(1);
            }}
          >
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
                <GridColumn field="CountyID" title="行政区" align="center" width={100} />
                <GridColumn field="NeighborhoodsID" title="镇街道" align="center" width={100} />
                {/* <GridColumn field="Name" title="名称" align="center" width={100} /> */}
                {/* <GridColumn field="DMType" title="地名类别" align="center" width={100} /> */}
                <GridColumn field="YMM" title="地名预命名" align="center" width={80} />
                <GridColumn field="MM" title="地名命名" align="center" width={80} />
                <GridColumn field="GM" title="地名更名" align="center" width={80} />
                <GridColumn field="XM" title="地名销名" align="center" width={80} />
                <GridColumn field="HB" title="地名换补" align="center" width={80} />
                {/* <GridColumn field="PFTime" title="批复时间" align="center" width={80} /> */}
              </DataGrid>
            </div>
            <div className={st.rowsfooter}>
              <Pagination
                showSizeChanger
                // 行数发生变化，默认从第一页开始
                onShowSizeChange={(page, size) => this.onShowSizeChange(1, size)}
                current={PageNum}
                PageSize={PageSize}
                total={Count}
                PageSizeOptions={[25, 50, 100, 200]}
                onChange={this.onShowSizeChange.bind(this)}
                // showTotal={(total, range) =>
                //   total ? `共：${total} 条，当前：${range[0]}-${range[1]} 条` : ''
                // }
              />
              共计：<span>{Count}</span>条，共<span>{Sum}</span>个区，其中地名预命名
              <span>{YMM}</span>条， 地名命名
              <span>{MM}</span>条，地名更名<span>{GM}</span>条， 地名销名<span>{XM}</span>
              条，地名换补<span>{HB}</span>条
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DmStatistic;
