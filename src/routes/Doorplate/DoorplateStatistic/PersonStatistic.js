import React, { Component } from 'react';
import {
  Select,
  DatePicker,
  Cascader,
  Button,
  Table,
  Pagination,
  Spin,
  Icon,
  notification,
  Row,
} from 'antd';
import st from './PersonStatistic.less';

import {
  url_GetUserWindows,
  url_ExportMPBusinessUserTJ,
  url_GetDistrictTreeFromDistrict,
  url_GetCurrentUserInfo,
  url_GetCreateUsers,
  url_GetMPBusinessDatas,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getDistrictsWithJX, convertNeighborhoodsIDToCascaderValue } from '../../../utils/utils.js';
import { getCreateUsers } from '../../../services/Common';
import { getMPBusinessUserTJ, GetConditionOfMPBusinessUserTJ } from '../../../services/MPStatistic';

class PersonStatistic extends Component {
  columns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '行政区', align: 'center', dataIndex: 'UserDistrict', key: 'UserDistrict' },
    { title: '受理窗口', align: 'center', dataIndex: 'Window', key: 'Window' },
    { title: '经办人', align: 'center', dataIndex: 'Name', key: 'Name' },
    { title: '办理类型', align: 'center', dataIndex: 'CertificateType', key: 'CertificateType' },
    { title: '办理时间', align: 'center', dataIndex: 'ItemTime', key: 'ItemTime' },
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
    pageSize: 10,
    pageNum: 1,
    loading: false,
    // ItemUser: undefined,
    userName: undefined,
    total2: 0,
    currentUserDist: undefined,
    currentUserID: undefined,
    currentUserWindow: undefined,
    CertificateType: undefined,
    conditionLoading: false,
  };

  // 动态查询条件
  condition = {
    pageSize: 10,
    pageNum: 1,
  };

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistrictsWithJX(e);
      this.setState({ districts: districts });
    });
  }

  async getCurrentUserInfo() {
    this.setState({ conditionLoading: true });
    await Post(url_GetCurrentUserInfo, null, e => {
      let currentUserDist = convertNeighborhoodsIDToCascaderValue(e.NeighborhoodsID);
      currentUserDist == null ? undefined : currentUserDist;
      let currentUserID = { label: e.Name, key: e.Name };
      let currentUserWindow = e.Window;
      currentUserWindow == null ? undefined : currentUserWindow;
      this.getCreateUsers(e.NeighborhoodsID, e.Window);

      this.setState({ currentUserDist, currentUserID, currentUserWindow, conditionLoading: false });
      this.condition.DistrictID = e.NeighborhoodsID;
      this.condition.ItemUser = e.Name;
      this.condition.Window = e.Window;
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
    // if (!condition.ItemUser) {
    //   notification.warn({ description: '请选择经办人！', message: '警告' });
    //   return;
    // }
    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    await getMPBusinessUserTJ(condition, d => {
      let { Count, Data, PersonInfo } = d;
      let { pageSize, pageNum } = this.state;
      this.setState({
        rows: Data.map((item, idx) => {
          item.index = (pageNum - 1) * pageSize + idx + 1;
          let a = item.UserDistrictID.split('.');
          item.UserDistrict = a[a.length - 1];
          return item;
        }),
        total: Count,
        mpz: PersonInfo && PersonInfo.length ? PersonInfo[0].MPZ : 0,
        dmzm: PersonInfo && PersonInfo.length ? PersonInfo[0].DMZM : 0,
        userName: PersonInfo && PersonInfo.length ? PersonInfo[0].userName : 0,
        total2: PersonInfo && PersonInfo.length ? PersonInfo[0].total : 0,
      });
      // this.refreshChart();
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
      window.open(url_ExportMPBusinessUserTJ, '_blank');
    });
  }

  async componentDidMount() {
    this.getDistricts();
    this.getWindows(null);
    this.getCurrentUserInfo();
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
      // ItemUser,
      currentUserDist,
      currentUserID,
      currentUserWindow,
      CertificateType,
      conditionLoading,
    } = this.state;
    let { edit } = this.props;
    return (
      <div className={st.PersonStatistic}>
        <div className={st.condition}>
          <Row style={{ marginBottom: 10 }}>
            <Spin wrapperClassName="ct-inline-loading" spinning={conditionLoading}>
              <Cascader
                allowClear
                expandTrigger="hover"
                placeholder="行政区"
                style={{ width: '250px' }}
                changeOnSelect
                options={districts}
                value={currentUserDist}
                onChange={e => {
                  this.condition.DistrictID = e && e.length ? e[e.length - 1] : undefined;
                  this.condition.Window = null;
                  this.condition.ItemUser = null;
                  if (e) {
                    this.getWindows(e[e.length - 1]);
                    this.getCreateUsers(e[e.length - 1], null);
                  }
                  this.setState({
                    currentUserDist: e,
                    currentUserWindow: undefined,
                    currentUserID: undefined,
                  });
                }}
              />
            </Spin>
            &emsp;
            <Spin wrapperClassName="ct-inline-loading" spinning={conditionLoading}>
              <Select
                allowClear
                style={{ width: 150 }}
                placeholder="受理窗口"
                value={currentUserWindow || undefined}
                onChange={e => {
                  this.condition.Window = e;
                  this.condition.ItemUser = null;
                  this.setState({
                    // ItemUser: undefined,
                    currentUserID: undefined,
                    createUsers: [],
                    currentUserWindow: e,
                  });
                  if (e) this.getCreateUsers(this.condition.DistrictID, e);
                }}
              >
                {windows.map(i => (
                  <Select.Option value={i}>{i}</Select.Option>
                ))}
              </Select>
            </Spin>
            &emsp;
            <Spin wrapperClassName="ct-inline-loading" spinning={conditionLoading}>
              <Select
                allowClear
                style={{ width: 200 }}
                labelInValue
                placeholder="经办人"
                onChange={e => {
                  this.condition.ItemUser = e && e.label;
                  this.setState({ /*ItemUser: e, */ currentUserID: e });
                }}
                value={currentUserID || undefined}
              >
                {createUsers.map(i => (
                  <Select.Option value={i.key}>{i.label}</Select.Option>
                ))}
              </Select>
            </Spin>
            &emsp;
            <Select
              allowClear
              style={{ width: 270 }}
              placeholder="办理类型"
              value={CertificateType || undefined}
              onChange={e => {
                this.condition.CertificateType = e;
                this.setState({
                  CertificateType: e,
                });
              }}
            >
              <Select.Option value={'GRSQ'}>个人申请门（楼）牌号码及门牌证</Select.Option>
              <Select.Option value={'DWSQ'}>单位申请门（楼）牌号码及门牌证</Select.Option>
              <Select.Option value={'GRBG'}>个人申请变更门牌证</Select.Option>
              <Select.Option value={'DWBG'}>单位申请变更门牌证</Select.Option>
              <Select.Option value={'GRHB'}>个人申请换（补）发门牌证</Select.Option>
              <Select.Option value={'DWHB'}>单位申请换（补）发门牌证</Select.Option>
              <Select.Option value={'GRZX'}>个人申请注销门（楼）牌号码及门牌证</Select.Option>
              <Select.Option value={'DWZX'}>单位申请注销门（楼）牌号码及门牌证</Select.Option>
              <Select.Option value={'DZZM'}>地名证明</Select.Option>
            </Select>
            &emsp;
          </Row>
          <Row>
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
          </Row>
        </div>

        <div className={st.body}>
          {/*
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
          */}
          <div className={st.rows}>
            {/*<div className={st.title}>业务办理详情</div>*/}
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
