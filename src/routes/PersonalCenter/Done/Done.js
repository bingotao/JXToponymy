import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';
import {
  Select,
  Button,
  Pagination,
  Spin,
  Icon,
  Tag,
  Modal,
  Alert,
  DatePicker,
  Cascader,
  Drawer,
  Row,
} from 'antd';
import st from './Done.less';
import {
  url_GetDistrictTreeFromDistrict,
  url_ExportBusinessTJ,
  url_GetTJByDistinct,
  url_SearchSettlementDMByID,
  url_SearchBuildingDMByID,
  url_SearchRoadDMByID,
  url_SearchBridgeDMByID,
  url_SearchResidenceMPByID,
  url_SearchRoadMPByID,
  url_SearchCountryMPID,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getUser } from '../../../utils/login';
import { rtHandle } from '../../../utils/errorHandle.js';
import { getDistrictsWithJX } from '../../../utils/utils.js';
import { GetPersonTodoBusinessTJ } from '../../../services/MPStatistic';

// import { GetDoneItems } from '../../../services/PersonalCenter';
// import { CheckSBInformation } from '../../../services/HomePage';
import { error, success } from '../../../utils/notification';
import Authorized, { validateC_ID } from '../../../utils/Authorized4';
import { Tjfs, Sqfs, Sxlx, Bssx_mpgl, Bssx_dmzm, Bssx_dmgl } from '../../../common/enums.js';

import HDFormNew from '../../Doorplate/Forms/HDFormNew';
import VGFormNew from '../../Doorplate/Forms/VGFormNew';
import RDFormNew from '../../Doorplate/Forms/RDFormNew';

import SettlementForm from '../../Toponymy/Forms/SettlementForm';
import BridgeForm from '../../Toponymy/Forms/BridgeForm';
import BuildingForm from '../../Toponymy/Forms/BuildingForm';
import RoadForm from '../../Toponymy/Forms/RoadForm';

import Detail from '../Component/Detail';

class Done extends Component {
  state = {
    districts: [],

    total: 0,
    PageSize: 10,
    PageNum: 1,

    loading: false,
    rows: [],

    showDrawerM: false,
    tjData: {},
  };
  condition = {
    PageSize: 10,
    PageNum: 1,
    State: 2, // 已办
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
    await GetPersonTodoBusinessTJ(condition, e => {
      this.setState({ loading: false });
      let { Query, Count } = e;
      Query.map((item, idx) => (item.index = idx + 1));
      this.setState(
        { rows: Query, total: Count }
        // this.refreshChart.bind(this)
      );
    });
    this.setState({ loading: false });
  }

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistrictsWithJX(e);
      this.setState({ districts: districts });
    });
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

  showDrawer = () => {
    this.setState({
      showDrawerM: true,
    });
  };

  onClose = () => {
    this.setState({
      showDrawerM: false,
    });
  };

  // 统计
  async getTJByDistinct(plid, pagename, activeTab) {
    let rt = await Post(url_GetTJByDistinct);
    rtHandle(rt, d => {
      this.setState({ tjData: d });
    });
  }

  /* 详情 */
  onDetail(e) {
    let { ID, PLID, PostWay, Item, Type } = e;
    debugger;
    this.setState({
      rcdID: ID,
      rcdPLID: PLID,
      rcdPostWay: PostWay,
      rcdInfo: e,
      rcdItem: Item,
      rcdType: Type,
    });
    if (PostWay == '网上申请') {
      if (Item == '门牌管理') {
        this.setMpDetail(PLID, Type);
      }
      if (Item == '地名管理') {
        this.setDmDetail(PLID, Type);
      }
      if (Item == '地名证明') {
        this.setMpDetail(PLID, Type);
      }
    } else {
      this.setState({
        showDetailForm: true,
        rcdItem: Item,
        rcdType: Type,
        rcdPLID: PLID,
        rcdPostWay: PostWay,
      });
    }
  }
  closeDetailForm() {
    this.setState({ showDetailForm: false });
  }
  // 网上申请-门牌-详情
  async setMpDetail(plid, type) {
    var url = url_SearchResidenceMPByID;
    if (type == 'Road') {
      url = url_SearchRoadMPByID;
    }
    if (type == 'Country') {
      url = url_SearchCountryMPID;
    }
    let rt = await Post(url, { PLID: plid });
    rtHandle(rt, d => {
      this.setState({ showDetailForm: true, DETAIL_INFO: d });
    });
  }
  // 网上申请-地名-详情
  async setDmDetail(plid, type) {
    var url = url_SearchSettlementDMByID;
    if (type == 'Building') {
      url = url_SearchBuildingDMByID;
    }
    if (type == 'Road') {
      url = url_SearchRoadDMByID;
    }
    if (type == 'Bridge') {
      url = url_SearchBridgeDMByID;
    }
    let rt = await Post(url, { PLID: plid });
    rtHandle(rt, d => {
      this.setState({ showDetailForm: true, DETAIL_INFO: d });
    });
  }

  componentDidMount() {
    // this.search();
    this.getDistricts();
    this.getTJByDistinct();
    this.onShowSizeChange(1);
  }

  render() {
    let {
      rows,
      loading,
      total,
      PageSize,
      PageNum, // 表格分页相关
      districts,
      PostWay,
      ApplicationWay,
      Item, // 查询中填充
      showDetailForm,
      showChoseForm, // modal显示隐藏
      rcdPostWay,
      rcdType,
      rcdItem,
      rcdItemType,
      rcdID,
      rcdPLID, // 选择中的数据
      showDrawerM,
      DETAIL_INFO, // 详情中显示的信息
      rcdInfo, // 一条记录中的信息-办理时用
      tjData,
    } = this.state;
    return (
      <div className="ct-sc">
        <div className={st.Done}>
          {/* 查询条件 */}
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
              placeholder="提交方式"
              style={{ width: 150 }}
              value={PostWay || undefined}
              onChange={e => {
                this.condition.PostWay = e;
                this.setState({ PostWay: e });
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
              value={ApplicationWay || undefined}
              onChange={e => {
                this.condition.ApplicationWay = e;
                this.setState({ ApplicationWay: e });
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
              value={Item || undefined}
              onChange={e => {
                this.condition.Item = e;
                this.setState({ Item: e });
              }}
            >
              {Sxlx.map(d => (
                <Select.Option key={d} value={d}>
                  {d}
                </Select.Option>
              ))}
            </Select>
            &emsp;
            {Item == '门牌管理' ? (
              <Select
                allowClear
                placeholder="办事事项"
                style={{ width: 210 }}
                // value={ItemType || undefined}
                onChange={e => {
                  this.condition.ItemType = e;
                  this.setState({ ItemType: e });
                }}
              >
                {Bssx_mpgl.map(d => (
                  <Select.Option key={d} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            ) : null}
            {Item == '地名证明' ? (
              <Select
                allowClear
                placeholder="办事事项"
                style={{ width: 150 }}
                value={Bssx_dmzm[0]}
                onChange={e => {
                  this.condition.ItemType = e;
                  this.setState({ ItemType: e });
                }}
              >
                {Bssx_dmzm.map(d => (
                  <Select.Option key={d} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            ) : null}
            {Item == '地名管理' ? (
              <Select
                allowClear
                placeholder="办事事项"
                style={{ width: 350 }}
                // value={Item || undefined}
                onChange={e => {
                  this.condition.ItemType = e;
                  this.setState({ ItemType: e });
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
                this.condition.SLTimeStart = e && e.format('YYYY-MM-DD HH:mm:ss.SSS');
              }}
              placeholder="办理日期（起）"
              style={{ width: '150px' }}
            />
            &ensp;~ &ensp;
            <DatePicker
              onChange={e => {
                this.condition.SLTimeEnd = e && e.format('YYYY-MM-DD HH:mm:ss.SSS');
              }}
              placeholder="办理日期（止）"
              style={{ width: '150px' }}
            />
            &emsp;
            <Button
              type="primary"
              onClick={e => {
                this.onShowSizeChange(1);
              }}
            >
              确定
            </Button>
            {/* &emsp;
            <Button
              type="primary"
              onClick={this.showDrawer}
            >
              统计
            </Button> */}
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
                  <GridColumn field="DistrictID" title="行政区" align="center" width={60} />
                  <GridColumn field="SBLY" title="受理窗口" align="center" width={100} />
                  <GridColumn field="PostWay" title="提交方式" align="center" width={60} />
                  <GridColumn field="ApplicationWay" title="申请方式" align="center" width={80} />
                  <GridColumn field="Item" title="事项类型" align="center" width={60} />
                  <GridColumn field="ItemType" title="办事事项" align="center" width={150} />
                  <GridColumn field="ItemContent" title="事项内容" align="center" width={150} />
                  <GridColumn field="SLUser" title="经办人" align="center" width={80} />
                  <GridColumn
                    field="SLTime"
                    title="办理日期"
                    align="center"
                    width={80}
                    render={({ value, row, rowIndex }) => {
                      // YYYY-MM-DD hh:mm:s
                      if (value && value.indexOf('-') != -1)
                        return moment(value).format('YYYY-MM-DD');
                    }}
                  />
                  <GridColumnGroup frozen align="right" width={140}>
                    <GridHeaderRow>
                      <GridColumn
                        field="State"
                        title="操作"
                        align="center"
                        render={({ value, row, rowIndex }) => {
                          let i = row;
                          var cz = (
                            <div className={st.rowbtns}>
                              <Icon type="bars" title="详情" onClick={e => this.onDetail(i)} />
                            </div>
                          );
                          return cz;
                        }}
                      />
                    </GridHeaderRow>
                  </GridColumnGroup>
                </DataGrid>
              </div>
              <div className={st.rowsfooter}>
                <Pagination
                  showSizeChanger
                  // 行数发生变化，默认从第一页开始
                  onShowSizeChange={(page, size) => this.onShowSizeChange(1, size)}
                  current={PageNum}
                  pageSize={PageSize}
                  total={total}
                  pageSizeOptions={[15, 25, 50, 100]}
                  onChange={this.onShowSizeChange.bind(this)}
                  showTotal={(total, range) =>
                    total ? `共：${total} 条，当前：${range[0]}-${range[1]} 条` : ''
                  }
                />
                地名居名点<span>{tjData.DM_Settlement}</span>条， 地名建筑物
                <span>{tjData.DM_Building}</span>条， 地名道路街巷<span>{tjData.DM_Road}</span>条，
                地名桥梁<span>{tjData.DM_Bridge}</span>条， 住宅门牌
                <span>{tjData.MP_Residence}</span>条， 道路门牌<span>{tjData.MP_Road}</span>条，
                农村门牌<span>{tjData.MP_Country}</span>条
              </div>
            </div>
          </div>
        </div>
        {/* 详情 */}
        <Modal
          wrapClassName={st.hdPopupForm}
          visible={showDetailForm}
          destroyOnClose={true}
          onCancel={this.closeDetailForm.bind(this)}
          title={'详情'}
          footer={null}
        >
          <Authorized>
            <div>
              {/* 现场申请 */}
              {rcdPostWay == '现场申请' && rcdItem == '门牌管理' && rcdType == 'Road' ? (
                <RDFormNew
                  FormType="MPXQ"
                  showDetailForm={true}
                  id={rcdPLID}
                  PostWay={rcdPostWay}
                  Item={rcdItem}
                  Type={rcdType}
                  onSaveSuccess={e => this.search(this.condition)}
                  onCancel={e => this.setState({ showDetailForm: false })}
                />
              ) : null}
              {rcdPostWay == '现场申请' && rcdItem == '门牌管理' && rcdType == 'Country' ? (
                <VGFormNew
                  FormType="MPXQ"
                  showDetailForm={true}
                  id={rcdPLID}
                  PostWay={rcdPostWay}
                  Item={rcdItem}
                  Type={rcdType}
                  onSaveSuccess={e => this.search(this.condition)}
                  onCancel={e => this.setState({ showDetailForm: false })}
                />
              ) : null}
              {rcdPostWay == '现场申请' && rcdItem == '门牌管理' && rcdType == 'Residence' ? (
                <HDFormNew
                  FormType="MPXQ"
                  showDetailForm={true}
                  id={rcdPLID}
                  PostWay={PostWay}
                  Item={rcdItem}
                  Type={rcdType}
                  onSaveSuccess={e => this.search(this.condition)}
                  onCancel={e => this.setState({ showDetailForm: false })}
                />
              ) : null}
              {rcdPostWay == '现场申请' && rcdItem == '地名管理' && rcdType == 'Settlement' ? (
                <SettlementForm
                  FormType="DMXQ"
                  showDetailForm={true}
                  id={rcdPLID}
                  PostWay={PostWay}
                  Item={rcdItem}
                  Type={rcdType}
                  onSaveSuccess={e => this.search(this.condition)}
                  onCancel={e => this.setState({ showDetailForm: false })}
                />
              ) : null}
              {rcdPostWay == '现场申请' && rcdItem == '地名管理' && rcdType == 'Building' ? (
                <BuildingForm
                  FormType="DMXQ"
                  showDetailForm={true}
                  id={rcdPLID}
                  PostWay={rcdPostWay}
                  Item={rcdItem}
                  Type={rcdType}
                  onSaveSuccess={e => this.search(this.condition)}
                  onCancel={e => this.setState({ showDetailForm: false })}
                />
              ) : null}
              {rcdPostWay == '现场申请' && rcdItem == '地名管理' && rcdType == 'Road' ? (
                <RoadForm
                  FormType="DMXQ"
                  showDetailForm={true}
                  id={rcdPLID}
                  PostWay={rcdPostWay}
                  Item={rcdItem}
                  Type={rcdType}
                  onSaveSuccess={e => this.search(this.condition)}
                  onCancel={e => this.setState({ showDetailForm: false })}
                />
              ) : null}
              {rcdPostWay == '现场申请' && rcdItem == '地名管理' && rcdType == 'Bridge' ? (
                <BridgeForm
                  FormType="DMXQ"
                  showDetailForm={true}
                  id={rcdPLID}
                  PostWay={rcdPostWay}
                  Item={rcdItem}
                  Type={rcdType}
                  onSaveSuccess={e => this.search(this.condition)}
                  onCancel={e => this.setState({ showDetailForm: false })}
                />
              ) : null}
              {/* 网上申请 */}
              {rcdPostWay == '网上申请' ? (
                <div>
                  <Detail rcdItem={rcdItem} DETAIL_INFO={DETAIL_INFO} />
                  <Row>
                    <Button.Group style={{ marginTop: 10, width: '100%' }}>
                      <Button
                        icon="carry-out"
                        onClick={e => {
                          this.setState({ showDetailForm: false });
                          this.onBl(rcdInfo);
                        }}
                        style={{ width: '50%' }}
                      >
                        办理
                      </Button>
                      <Button
                        icon="delete"
                        onClick={e => {
                          this.setState({ showDetailForm: false });
                          this.onDelete(rcdInfo);
                        }}
                        style={{ width: '50%' }}
                      >
                        退件
                      </Button>
                    </Button.Group>
                  </Row>
                </div>
              ) : null}
            </div>
          </Authorized>
        </Modal>
        {/* 侧边栏 */}
        <Drawer
          title="Basic Drawer"
          placement="right"
          closable={false}
          onClose={this.onClose}
          visible={showDrawerM}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
      </div>
    );
  }
}

export default withRouter(Done);
