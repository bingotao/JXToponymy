import React, { Component } from 'react';
import { Select, DatePicker, Cascader, Button, Table, Pagination } from 'antd';
import st from './PersonStatistic.less';

import { bllx } from '../../../common/enums.js';

class PersonStatistic extends Component {
  columns = [
    { title: '序号', dataIndex: 'index', key: 'index' },
    { title: '市辖区', dataIndex: 'index', key: 'index' },
    { title: '受理窗口', dataIndex: 'index', key: 'index' },
    { title: '经办人', dataIndex: 'index', key: 'index' },
    { title: '办理类型', dataIndex: 'index', key: 'index' },
    { title: '操作内容', dataIndex: 'index', key: 'index' },
    { title: '办理时间', dataIndex: 'index', key: 'index' },
  ];

  render() {
    return (
      <div className={st.PersonStatistic}>
        <div>
          <Cascader placeholder="经办人" style={{ margin: '0 5px' }} />
          <DatePicker style={{ margin: '0 5px' }} placeholder="开始时间" />
          ~
          <DatePicker style={{ margin: '0 5px' }} placeholder="结束时间" />
          <Select style={{ width: 200, margin: '0 5px' }} placeholder="办理类型">
            { ['全部'].concat(bllx).map(i => <Select.Option value={i}>{i}</Select.Option>)}
          </Select>
          <Button style={{ margin: '0 5px' }} type="primary" icon="pie-chart">
            统计
          </Button>
        </div>
        <div className={st.body}>
          <div className={st.statistic}>
            <div className={st.person}>
              <div className={st.title}>个人信息</div>
              <div className={st.persondetails}>
                <span>陈韬（事业部）</span>
                <span>
                  共办理业务：<span>&ensp;52&ensp;</span>项
                </span>
                <span>其中：</span>
                <span>
                  &emsp;打印门牌证：<span>&ensp;20&ensp;</span>项
                </span>
                <span>
                  &emsp;开具地名证明：<span>&ensp;32&ensp;</span>项
                </span>
              </div>
            </div>
            <div className={st.chart}>
              <div className={st.title}>统计图</div>
              <div ref={e => (this.chart = e)} className={st.chartcontent} />
            </div>
          </div>
          <div className={st.rows}>
            <div className={st.title}>业务办理详情</div>
            <div className={st.rowsbody}>
              <Table columns={this.columns} />
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

export default PersonStatistic;
