import React, { Component } from 'react';
import { Select, DatePicker, Cascader, Button, Table, Pagination, Icon } from 'antd';
import st from './PersonStatistic.less';

import { url_GetUserDistrictsTree, url_GetUserWindows, url_GetCreateUsers, url_GetMPBusinessDatas } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistricts } from '../../../utils/utils.js';
import { rtHandle } from '../../../utils/errorHandle.js';
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

  state = {
    rows: [],
    areas: [],
    windows: [],
    createUsers: [],
    total: 0,
    pageSize: 15,
    pageNumber: 1,
    loading: false,
  };

  // 动态查询条件
  queryCondition = {
  };

  // 点击搜索按钮，从第一页开始
  onSearchClick() {
    this.setState(
      {
        pageNumber: 1,
      },
      e => this.search(this.queryCondition)
    );
  }

  async search(condition) {
    let { pageSize, pageNumber } = this.state;
    let newCondition = {
      ...condition,
      PageSize: pageSize,
      pageNum: pageNumber,
    };
    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    let rt = await Post(url_GetMPBusinessDatas, newCondition);
    this.setState({ loading: false });
    rtHandle(rt, data => {
      let { pageSize, pageNumber } = this.state;
      this.condition = newCondition;
      this.setState({
        total: data.Count,
        rows: data.Data.map((e, i) => {
          e.index = (pageNumber - 1) * pageSize + i + 1;
          e.key = e.ID;
          return e;
        }),
      });
    });
  }

  async componentDidMount() {
    // let rt = await Post(url_GetUserDistrictsTree);
    // rtHandle(rt, d => {
    //   let areas = getDistricts(d);
    //   this.setState({ areas: areas });
    // });

    // let windows = await Post(url_GetUserWindows);
    // rtHandle(windows, d => {
    //   this.setState({ windows: d });
    // });

    // let createUsers = await Post(url_GetCreateUsers);
    // rtHandle(createUsers, d => {
    //   this.setState({ createUsers: d });
    // });
  }

  render() {
    let {
      total,
      rows,
      areas,
      windows,
      createUsers,
      pageSize,
      pageNumber,
      loading,
      expand,
    } = this.state;

    return (
      <div className={st.PersonStatistic}>
        <div className={st.condition} >
            <Select style={{ width: 150 }} placeholder="受理窗口">
              {windows.map(i => <Select.Option value={i}>{i}</Select.Option>)}
            </Select>
            &emsp;
            <Select style={{ width: 150 }} placeholder="经办人">
              {createUsers.map(i => <Select.Option value={i}>{i}</Select.Option>)}
            </Select>
            &emsp;
            <DatePicker placeholder="办理时间（起）" />
            &emsp;~&emsp;
            <DatePicker placeholder="办理时间（止）" />
            &emsp;
            <Button type="primary" icon="pie-chart">
              统计
            </Button>
            &emsp;
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

export default PersonStatistic;
