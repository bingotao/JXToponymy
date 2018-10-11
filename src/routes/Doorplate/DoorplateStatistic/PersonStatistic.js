import React, { Component } from 'react';
import { Select, DatePicker, Cascader, Button, Table, Pagination, Icon } from 'antd';
import st from './PersonStatistic.less';

import {
  url_GetUserWindows,
  url_GetCreateUsers,
  url_GetMPBusinessDatas,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';

class PersonStatistic extends Component {
  columns = [
    { title: '序号', dataIndex: 'index', key: 'index' },
    { title: '市辖区', dataIndex: 'index', key: 'index' },
    { title: '受理窗口', dataIndex: 'index', key: 'index' },
    { title: '经办人', dataIndex: 'index', key: 'index' },
    { title: '办理类型', dataIndex: 'index', key: 'index' },
    { title: '办理时间', dataIndex: 'index', key: 'index' },
    { title: '操作内容', dataIndex: 'index', key: 'index' },
  ];

  state = {
    rows: [],
    windows: [],
    createUsers: [],
    total: 0,
    mpz: 0,
    dmzm: 0,
    user: {},
    pageSize: 25,
    pageNum: 1,
    loading: false,
  };

  // 动态查询条件
  condition = {
    pageSize: 25,
    pageNum: 1,
  };

  // 点击搜索按钮，从第一页开始
  onSearchClick() {
    this.onShowSizeChange(1, null);
  }

  onShowSizeChange(pn, ps) {
    let page = {};
    if (pn) page.pageNum = pn;
    if (ps) page.pageSize = ps;
    this.setState(page);
    let condition = {
      ...this.condition,
      ...page,
    };
    this.search(condition);
  }

  async search(condition) {
    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    await Post(url_GetMPBusinessDatas, condition, data => {
      let { pageSize, pageNumber } = this.state;
      this.condition = condition;
      this.setState({
        total: data.Count,
        rows: data.Data.map((e, i) => {
          e.index = (pageNumber - 1) * pageSize + i + 1;
          e.key = e.ID;
          return e;
        }),
      });
    });
    this.setState({ loading: false });
  }

  async getWindows() {
    await Post(url_GetUserWindows, null, e => {
      this.setState({ windows: e });
    });
  }

  async getUsers() {
    await Post(url_GetCreateUsers, null, e => {
      this.setState({ users: e });
    });
  }

  async componentDidMount() {
    this.getWindows();
    this.getUsers();
  }

  render() {
    let {
      user,
      total,
      rows,
      windows,
      createUsers,
      pageSize,
      pageNum,
      loading,
      mpz,
      dmzm,
    } = this.state;

    return (
      <div className={st.PersonStatistic}>
        <div className={st.condition}>
          <Select
            allowClear
            style={{ width: 150 }}
            placeholder="受理窗口"
            onChange={e => (this.condition.Window = e)}
          >
            {windows.map(i => <Select.Option value={i}>{i}</Select.Option>)}
          </Select>
          &emsp;
          <Select
            allowClear
            style={{ width: 150 }}
            placeholder="经办人"
            onChange={e => (this.condition.CreateUser = e)}
          >
            {createUsers.map(i => <Select.Option value={i}>{i}</Select.Option>)}
          </Select>
          &emsp;
          <DatePicker
            placeholder="办理时间（起）"
            onChange={e => {
              this.condition.start = e && e.toISOString();
            }}
          />
          &emsp;~&emsp;
          <DatePicker
            placeholder="办理时间（止）"
            onChange={e => {
              this.condition.end = e && e.toISOString();
            }}
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
        </div>
        <div className={st.body}>
          <div className={st.statistic}>
            <div className={st.person}>
              <div className={st.title}>个人信息</div>
              <div className={st.persondetails}>
                {user.Name ? (
                  <span>
                    {user.Name}（{user.Department}）
                  </span>
                ) : null}
                <span>
                  共办理业务：<span>&ensp;{total}&ensp;</span>项
                </span>
                <span>其中：</span>
                <span>
                  &emsp;打印门牌证：<span>&ensp;{mpz}&ensp;</span>项
                </span>
                <span>
                  &emsp;开具地名证明：<span>&ensp;{dmzm}&ensp;</span>项
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
              <Table
                bordered
                pagination={false}
                columns={this.columns}
                dataSource={rows}
                loading={loading}
              />
            </div>
            <div className={st.rowsfooter}>
              <Pagination
                showSizeChanger
                // 行数发生变化，默认从第一页开始
                onShowSizeChange={(page, size) => this.onShowSizeChange(1, size)}
                current={pageNum}
                pageSize={pageSize}
                total={total}
                pageSizeOptions={[25, 50, 100, 200]}
                onChange={this.onShowSizeChange.bind(this)}
                showTotal={(total, range) =>
                  total ? `共：${total} 条，当前：${range[0]}-${range[1]} 条` : ''
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PersonStatistic;
