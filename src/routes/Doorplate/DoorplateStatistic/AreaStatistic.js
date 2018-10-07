import React, { Component } from 'react';
import { Select, DatePicker, Cascader, Button, Table, Pagination } from 'antd';
import st from './AreaStatistic.less';

class AreaStatistic extends Component {
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

  render() {
    return (
      <div className={st.AreaStatistic}>
        <div>
          <Cascader placeholder="行政区" style={{ width: 150 }} />
          &emsp;
          <Select placeholder="村社区" style={{ width: 150 }} allowclear></Select>
          &emsp;
          <DatePicker placeholder="开始时间" />
          &emsp;~&emsp;
          <DatePicker placeholder="结束时间" />
          &emsp;
          <Button type="primary" icon="pie-chart">
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
              <Table bordered columns={this.columns} />
            </div>
            <div className={st.rowsfooter}>
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AreaStatistic;
