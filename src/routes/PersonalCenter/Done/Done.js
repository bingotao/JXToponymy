import React, { Component } from 'react';
import {
  Select,
  DatePicker,
  Cascader,
  Button,
  Pagination,
  Spin,
  Icon,
  Tag,
  Modal,
  Alert,
} from 'antd';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';

import st from './Done.less';
import { url_GetDistrictTreeFromDistrict, url_ExportBusinessTJ } from '../../../common/urls.js';
// import { GetDoneItems } from '../../../services/PersonalCenter';
import { getDistrictsWithJX } from '../../../utils/utils.js';
// import { CheckSBInformation } from '../../../services/HomePage';
import { error, success } from '../../../utils/notification';
import { getUser } from '../../../utils/login';
import Authorized, { validateC_ID } from '../../../utils/Authorized4';
import { Tjfs, Sqfs, Sxlx, Bssx_mpgl, Bssx_dmzm, Bssx_dmgl } from '../../../common/enums.js';

class Done extends Component {
  state = {
    districts: [],

    total: 0,
    pageSize: 15,
    pageNumber: 1,

    loading: false,
    rows: [],
  };
  condition = {
    // pageSize: 1000,
    // pageNum: 1,
    // total: 100,
  };

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistrictsWithJX(e);
      this.setState({ districts: districts });
    });
  }
  async search(condition) {
    let { pageSize, pageNumber } = this.state;
    let newCondition = {
      ...condition,
      PageSize: pageSize,
      pageNum: pageNumber,
    };
    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    await GetDMBusinessTJ(this.condition, e => {
      this.setState({ loading: false });
      let { PersonInfo, YMM, MM, GM, XM, HB, Count, Sum } = e;
      PersonInfo.map((item, idx) => (item.index = idx + 1));
      this.setState(
        { rows: PersonInfo, Count: Count, YMM, MM, GM, XM, HB, Sum }
        // this.refreshChart.bind(this)
      );
    });
    this.setState({ loading: false });
  }

  // Pagenation发生变化时
  onShowSizeChange(pn, ps) {
    this.setState(
      {
        pageNumber: pn,
        pageSize: ps,
      },
      e => this.search(this.queryCondition)
    );
  }

  onEdit(i) {
    let { ID, SIGN } = i;
    let user = getUser();
    if (user) {
      let newUrl = `${selfSystemUrl}?id=${ID}&yj=1&userid=${user.userId}&username=${user.userName}&target=${SIGN}`;
      window.open(newUrl, '_blank');
    } else {
      error('请先登录');
    }
  }

  componentDidMount() {
    this.getDistricts();
    // this.search();
  }

  render() {
    let { rows, loading, total, pageSize, pageNum, districts, tjfs, sqfs, sxlx } = this.state;
    console.log(Tjfs);
    return (
      <div className="ct-sc">
        <div className={st.Done}>
          <div>
            {/* 查询条件 */}
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
              placeholder="提交方式"
              style={{ width: 150 }}
              value={tjfs || undefined}
              onChange={e => {
                this.condition.tjfs = e;
                this.setState({ tjfs: e });
              }}
            >
              {Tjfs.map(d => (
                <Select.Option key={d} value={d}>
                  {d}
                </Select.Option>
              ))}
            </Select>
            &emsp;
            <Select
              allowClear
              placeholder="申请方式"
              style={{ width: 150 }}
              value={sqfs || undefined}
              onChange={e => {
                this.condition.sqfs = e;
                this.setState({ sqfs: e });
              }}
            >
              {Sqfs.map(d => (
                <Select.Option key={d} value={d}>
                  {d}
                </Select.Option>
              ))}
            </Select>
            &emsp;
            <Select
              allowClear
              placeholder="事项类型"
              style={{ width: 150 }}
              value={sxlx || undefined}
              onChange={e => {
                this.condition.sxlx = e;
                this.setState({ sxlx: e });
              }}
            >
              {Sxlx.map(d => (
                <Select.Option key={d} value={d}>
                  {d}
                </Select.Option>
              ))}
            </Select>
            &emsp;
            {sxlx == '门牌管理' ? (
              <Select
                allowClear
                placeholder="办事事项"
                style={{ width: 210 }}
                // value={mpgl || undefined}
                onChange={e => {
                  this.condition.mpgl = e;
                  this.setState({ mpgl: e });
                }}
              >
                {Bssx_mpgl.map(d => (
                  <Select.Option key={d} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            ) : null}
            {sxlx == '地名证明' ? (
              <Select
                allowClear
                placeholder="办事事项"
                style={{ width: 150 }}
                value={Bssx_dmzm[0]}
                onChange={e => {
                  this.condition.dmzm = e;
                  this.setState({ dmzm: e });
                }}
              >
                {Bssx_dmzm.map(d => (
                  <Select.Option key={d} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            ) : null}
            {sxlx == '地名管理' ? (
              <Select
                allowClear
                placeholder="办事事项"
                style={{ width: 350 }}
                // value={sxlx || undefined}
                onChange={e => {
                  this.condition.sxlx = e;
                  this.setState({ sxlx: e });
                }}
              >
                {Bssx_dmgl.map(d => (
                  <Select.Option key={d} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            ) : null}
            &emsp;
            <DatePicker
              onChange={e => {
                this.condition.start = e && e.format('YYYY-MM-DD');
              }}
              placeholder="办理日期（起）"
              style={{ width: '150px' }}
            />
            &ensp;~ &ensp;
            <DatePicker
              onChange={e => {
                this.condition.end = e && e.format('YYYY-MM-DD');
              }}
              placeholder="办理日期（止）"
              style={{ width: '150px' }}
            />
            &emsp;
            <Button
              type="primary"
              onClick={e => {
                this.setState({ pageNum: 1 }, e => this.search());
              }}
            >
              确定
            </Button>
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
                <DataGrid
                  // id="门牌编制"
                  // key="门牌编制"
                  data={rows}
                  style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
                  // onRowDblClick={i => this.onEdit(i)}
                >
                  <GridColumn field="index" title="序号" align="center" width={60} />
                  <GridColumn field="CountyID" title="行政区" align="center" width={100} />
                  <GridColumn field="NeighborhoodsID" title="受理窗口" align="center" width={100} />
                  <GridColumn field="YMM" title="提交方式" align="center" width={80} />
                  <GridColumn field="MM" title="申请方式" align="center" width={80} />
                  <GridColumn field="GM" title="事项类型" align="center" width={80} />
                  <GridColumn field="XM" title="办事事项" align="center" width={80} />
                  <GridColumn field="HB" title="事项内容" align="center" width={80} />
                  <GridColumn field="HB" title="经办人" align="center" width={80} />
                  <GridColumn field="HB" title="办理日期" align="center" width={80} />
                  <GridColumnGroup frozen align="right" width="120px">
                    <GridHeaderRow>
                      <GridColumn
                        field="State"
                        title="操作"
                        align="center"
                        render={({ value, row, rowIndex }) => {
                          let i = row;
                          return (
                            <div className={st.rowbtns}>
                              <Icon type="edit" title="办理" onClick={e => this.onEdit(i)} />
                              <Icon type="delete" title="删除" onClick={e => this.onEdit(i)} />
                            </div>
                          );
                        }}
                      />
                    </GridHeaderRow>
                  </GridColumnGroup>
                </DataGrid>
              </div>
              <div className={st.rowsfooter}>
                {/* <Pagination
                  showTotal={(t, rg) => {
                    let { total, pageSize, pageNum, rows } = this.state;
                    return total ? (
                      <span>
                        共&ensp;<strong>{total}</strong>&ensp;条，当前&ensp;
                        <strong>{(pageNum - 1) * pageSize + 1}</strong>&ensp;-&ensp;
                        <strong>{(pageNum - 1) * pageSize + rows.length}</strong>&ensp;条&emsp;
                      </span>
                    ) : (
                      ''
                    );
                  }}
                  total={total}
                  current={pageNum}
                  pageSize={pageSize}
                  pageSizeOptions={[20, 50, 100, 200]}
                  showSizeChanger
                  onShowSizeChange={(pn, ps) => {
                    this.setState({ pageNum: 1, pageSize: ps }, e =>
                      this.search(this.queryCondition)
                    );
                  }}
                  onChange={(pn, ps) => {
                    this.setState({ pageNum: pn }, e => this.search(this.queryCondition));
                  }}
                /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Done;
