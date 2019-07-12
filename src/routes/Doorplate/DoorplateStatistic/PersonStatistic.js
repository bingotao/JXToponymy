import React, { Component } from 'react';
import { Select, DatePicker, Cascader, Button, Table, Pagination, Icon, notification } from 'antd';
import st from './PersonStatistic.less';

import {
  url_GetUserWindows,
  url_ExportMPBusinessUserTJ,
  url_GetDistrictTreeFromDistrict,
  url_GetCreateUsers,
  url_GetMPBusinessDatas,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistricts } from '../../../utils/utils.js';
import { getCreateUsers } from '../../../services/Common';
import {
  getMPBusinessUserTJ,
  GetConditionOfMPBusinessUserTJ,
  ExportMPBusinessUserTJ,
} from '../../../services/MPStatistic';

class PersonStatistic extends Component {
  columns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '行政区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    { title: '受理窗口', align: 'center', dataIndex: 'Window', key: 'Window' },
    { title: '经办人', align: 'center', dataIndex: 'Name', key: 'Name' },
    { title: '办理类型', align: 'center', dataIndex: 'CertificateType', key: 'CertificateType' },
    { title: '办理时间', align: 'center', dataIndex: 'CreateTime', key: 'CreateTime' },
    { title: '操作内容', align: 'center', dataIndex: 'StandardAddress', key: 'StandardAddress' },
  ];

  state = {
    rows: [],
    districts: [],
    windows: [],
    createUsers: [],
    total: 0,
    mpz: 0,
    dmzm: 0,
    user: {},
    pageSize: 8,
    pageNum: 1,
    loading: false,
    CreateUser: undefined,
    userName: undefined,
    total2: 0,
  };

  // 动态查询条件
  condition = {
    pageSize: 8,
    pageNum: 1,
  };

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

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
    if (!condition.CreateUser) {
      notification.warn({ description: '请选择经办人！', message: '警告' });
      return;
    }
    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    await getMPBusinessUserTJ(condition, d => {
      let { Count, Data, PersonInfo } = d;
      let { pageSize, pageNum } = this.state;
      this.setState({
        rows: Data.map((item, idx) => {
          item.index = (pageNum - 1) * pageSize + idx + 1;
          return item;
        }),
        total: Count,
        mpz: PersonInfo && PersonInfo.length ? PersonInfo[0].MPZ : 0,
        dmzm: PersonInfo && PersonInfo.length ? PersonInfo[0].DMZM : 0,
        userName: PersonInfo && PersonInfo.length ? PersonInfo[0].userName : 0,
        total2: PersonInfo && PersonInfo.length ? PersonInfo[0].total : 0,
      });
      this.refreshChart();
    });
    this.setState({ loading: false });
  }

  refreshChart() {
    let { dmzm, mpz } = this.state;
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
          radius: '60%',
          center: ['50%', '50%'],
          data: [{ name: '地名证明', value: dmzm }, { name: '打印门牌证', value: mpz }],
        },
      ],
    };

    this.chart.setOption(option);
  }

  async getWindows(DistrictID) {
    await Post(url_GetUserWindows, { DistrictID }, e => {
      this.setState({ windows: e });
    });
  }

  async getCreateUsers(DistrictID, window) {
    await getCreateUsers({ DistrictID, window }, d => {
      d = (d || []).map(function(x) {
        let vl = x.split('|');
        return {
          label: vl[1],
          key: vl[0],
        };
      });

      this.setState({ createUsers: d });
    });
  }

  async onExport() {
    await GetConditionOfMPBusinessUserTJ(this.condition, e => {
      debugger;
      window.open(url_ExportMPBusinessUserTJ, '_blank');
    });
  }

  async componentDidMount() {
    this.getDistricts();
    this.getWindows(null);
  }

  render() {
    let {
      userName,
      total,
      total2,
      rows,
      districts,
      windows,
      createUsers,
      pageSize,
      pageNum,
      loading,
      mpz,
      dmzm,
      CreateUser,
    } = this.state;
    let { edit } = this.props;
    return (
      <div className={st.PersonStatistic}>
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
              if (e) this.getWindows(e[e.length - 1]);
            }}
          />
          &emsp;
          <Select
            allowClear
            style={{ width: 150 }}
            placeholder="受理窗口"
            onChange={e => {
              this.condition.Window = e;
              this.setState({ CreateUser: undefined, createUsers: [] });
              if (e) this.getCreateUsers(this.condition.DistrictID, e);
            }}
          >
            {windows.map(i => <Select.Option value={i}>{i}</Select.Option>)}
          </Select>
          &emsp;
          <Select
            allowClear
            style={{ width: 150 }}
            labelInValue
            placeholder="经办人"
            onChange={e => {
              this.condition.CreateUser = e && e.key;
              this.setState({ CreateUser: e });
            }}
            value={CreateUser || undefined}
          >
            {createUsers.map(i => <Select.Option value={i.key}>{i.label}</Select.Option>)}
          </Select>
          &emsp;
          <DatePicker
            placeholder="办理时间（起）"
            onChange={e => {
              this.condition.start = e && e.format('YYYY-MM-DD');
            }}
          />
          &emsp;~&emsp;
          <DatePicker
            placeholder="办理时间（止）"
            onChange={e => {
              this.condition.end = e && e.format('YYYY-MM-DD');
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
          <div className={st.statistic}>
            <div className={st.person}>
              <div className={st.title}>个人信息</div>
              <div className={st.persondetails}>
                {userName ? <span>{userName}</span> : null}
                <span>
                  共办理业务：<span>&ensp;{total2}&ensp;</span>项
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
              <div ref={e => (this.chartDom = e)} className={st.chartcontent} />
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
                // scroll={{ y: 874 }}
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
