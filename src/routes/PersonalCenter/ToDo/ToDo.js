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
  Radio,
  Row,
  notification,
  Popover,
} from 'antd';
import st from './ToDo.less';
import {
  url_GetDistrictTreeFromDistrict,
  url_ExportBusinessTJ,
  url_GetPersonDMByID,
  url_GetPersonMPByID,
  url_DeletePersonMP,
  url_DeletePersonDM,
  url_GetFormFile,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getUser } from '../../../utils/login';
import { rtHandle } from '../../../utils/errorHandle.js';
import { GetPersonTodoBusinessTJ } from '../../../services/MPStatistic';

// import { GetTodoItems } from '../../../services/PersonalCenter';
// import { CheckSBInformation } from '../../../services/HomePage';
import { error, success } from '../../../utils/notification';
import Authorized, { validateC_ID } from '../../../utils/Authorized4';
import {
  Tjfs,
  Sqfs,
  Sxlx,
  Bssx_mpgl,
  Bssx_dmzm,
  Bssx_dmgl,
  mpFormType,
  dmFormType,
} from '../../../common/enums.js';

import HDFormNew from '../../Doorplate/Forms/HDFormNew';
import VGFormNew from '../../Doorplate/Forms/VGFormNew';
import RDFormNew from '../../Doorplate/Forms/RDFormNew';

import SettlementForm from '../../Toponymy/Forms/SettlementForm';
import BridgeForm from '../../Toponymy/Forms/BridgeForm';
import BuildingForm from '../../Toponymy/Forms/BuildingForm';
import RoadForm from '../../Toponymy/Forms/RoadForm';

import Detail from '../Component/Detail';

class ToDo extends Component {
  state = {
    showDetailForm: false,
    showChoseForm: false,

    rcdItem: '',

    total: 0,
    PageSize: 10,
    PageNum: 1,

    loading: false,
    rows: [],
  };
  condition = {
    PageSize: 10,
    PageNum: 1,
    State: 1, // 待办
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

  /* 删除-退件 */
  onDelete(e) {
    Modal.confirm({
      title: '提醒',
      content: '是否确认退件？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        let { PostWay, Item, ItemType, Type, ID } = e;
        if (PostWay == '网上申请') {
          if (Type.length <= 0) {
            // 跳出选择弹窗
            this.setState({
              showChoseForm: true,
              curOperate: 'delete',
              rcdItem: Item,
              rcdItemType: ItemType,
              rcdID: ID,
              WSSQ_DATA: e,
            });
          } else {
            if (Item == '门牌管理') {
              // 门牌
              this.deletePersonMP(ID, this.SLUser, Type);
            }
            if (Item == '地名管理') {
              // 地名
              this.deletePersonDM(ID, this.SLUser, Type);
            }
          }
        }
        if (PostWay == '现场申请') {
        }
      },
    });
  }
  // 网上申请-门牌-退件
  async deletePersonMP(ID, SLUser, Type) {
    let rt = await Post(url_DeletePersonMP, {
      ID: ID,
      SLTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      SLUser: SLUser,
      Type: Type,
    });
    rtHandle(rt, d => {
      notification.success({ description: '退件成功！', message: '成功' });
      //刷新待办列表
      this.onShowSizeChange();
    });
  }
  // 网上申请-地名-退件
  async deletePersonDM(ID, SLUser, Type) {
    let rt = await Post(url_DeletePersonDM, {
      ID: ID,
      SLTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      SLUser: SLUser,
      Type: Type,
    });
    rtHandle(rt, d => {
      notification.success({ description: '退件成功！', message: '成功' });
      //刷新待办列表
      this.onShowSizeChange();
    });
  }

  /* 详情 */
  onDetail(e) {
    let { ID, PLID, PostWay, Item, Type } = e;
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
        this.setMpDetail(PLID);
      }
      if (Item == '地名管理') {
        this.setDmDetail(PLID);
      }
      if (Item == '地名证明') {
        this.setMpDetail(PLID);
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
  async setMpDetail(plid) {
    let rt = await Post(url_GetPersonMPByID, { PLID: plid });
    rtHandle(rt, d => {
      this.setState({ showDetailForm: true, DETAIL_INFO: d });
    });
  }
  // 网上申请-地名-详情
  async setDmDetail(plid) {
    let rt = await Post(url_GetPersonDMByID, { PLID: plid });
    rtHandle(rt, d => {
      this.setState({ showDetailForm: true, DETAIL_INFO: d });
    });
  }

  /* 办理 */
  onBl(e) {
    let { PostWay, Item, ItemType, ID, PLID, Type, AddressCoding, DMCode } = e;
    // 一.网上申请
    if (PostWay == '网上申请') {
      // 1.门牌管理
      if (Item == '门牌管理') {
        if (
          ItemType == '个人申请门（楼）牌号码及门牌证' ||
          ItemType == '单位申请门（楼）牌号码及门牌证'
        ) {
          // 1-1.门牌-新数据-弹出选择弹框-选择后-跳转到编制
          this.setState({
            showChoseForm: true,
            curOperate: 'bl',
            rcdItem: Item,
            rcdItemType: ItemType,
            rcdPLID: PLID,
            WSSQ_DATA: e,
          });
        } else {
          var pagename = '',
            activeTab = '';
          // 1-2.门牌-老数据-不选-跳转到变更、换补、注销或地名证明
          if (ItemType.indexOf('变更') != -1) {
            pagename = mpFormType['门牌变更'];
          }
          if (ItemType.indexOf('换补') != -1) {
            pagename = mpFormType['门牌换补'];
          }
          if (ItemType.indexOf('注销') != -1) {
            pagename = mpFormType['门牌注销'];
          }
          if (ItemType.indexOf('证明') != -1) {
            pagename = mpFormType['门牌证明'];
          }
          switch (Type) {
            case 'Residence':
              activeTab = 'HDForm';
              break;
            case 'Road':
              activeTab = 'RDForm';
              break;
            case 'Country':
              activeTab = 'VGForm';
              break;
            default:
              break;
          }
          this.setMpBlOldData(PLID, pagename, activeTab, AddressCoding);
        }
      }
      // 2.地名证明
      if (Item == '地名证明') {
        this.setState({
          showChoseForm: true,
          curOperate: 'bl',
          rcdItem: Item,
          rcdItemType: ItemType,
          rcdPLID: PLID,
          WSSQ_DATA: e,
        });
      }
      // 3.地名管理
      if (Item == '地名管理') {
        if (ItemType.indexOf('命名') != -1 || ItemType.indexOf('预命名') != -1) {
          // 3-1.新数据
          this.setState({
            showChoseForm: true,
            curOperate: 'bl',
            rcdItem: Item,
            rcdItemType: ItemType,
            rcdPLID: PLID,
            WSSQ_DATA: e,
          });
        } else {
          // 3-2.旧数据
          var pagename = '',
            activeTab = '';
          if (ItemType.indexOf('更名') != -1) {
            pagename = dmFormType['地名更名'];
          }
          if (ItemType.indexOf('换') != -1) {
            pagename = dmFormType['地名换补'];
          }
          if (ItemType.indexOf('销名') != -1) {
            pagename = dmFormType['地名销名'];
          }
          if (ItemType.indexOf('受理') != -1) {
            pagename = dmFormType['地名受理'];
          }

          switch (Type) {
            case 'Settlement':
              activeTab = 'SettlementForm';
              break;
            case 'Building':
              activeTab = 'BuildingForm';
              break;
            case 'Road':
              activeTab = 'RoadForm';
              break;
            case 'Bridge':
              activeTab = 'BridgeForm';
              break;
            default:
              activeTab = 'SettlementForm'; // test
              break;
          }
          this.setDmBlOldData(PLID, pagename, activeTab, DMCode);
        }
      }
    }
    // 二.现场申请-库中已有数据，直接跳转
    if (PostWay == '现场申请') {
      var pagename = '',
        activeTab = '';
      // 1.门牌管理
      if (Item == '门牌管理') {
        if (ItemType.indexOf('变更') != -1) {
          pagename = mpFormType['门牌变更'];
        }
        if (ItemType.indexOf('换补') != -1) {
          pagename = mpFormType['门牌换补'];
        }
        if (ItemType.indexOf('注销') != -1) {
          pagename = mpFormType['门牌注销'];
        }
        if (ItemType.indexOf('证明') != -1) {
          pagename = mpFormType['门牌证明'];
        }
        switch (Type) {
          case 'Residence':
            activeTab = 'HDForm';
            break;
          case 'Road':
            activeTab = 'RDForm';
            break;
          case 'Country':
            activeTab = 'VGForm';
            break;
          default:
            break;
        }
        this.props.history.push({
          pathname: '/placemanage/doorplate/' + pagename,
          state: {
            activeTab: activeTab,
            id: PLID,
            blType: 'XCSQ_MP',
          },
        });
      }
      // 2.地名证明
      if (Item == '地名证明') {
      }
      // 3.地名管理
      if (Item == '地名管理') {
        if (ItemType.indexOf('更名') != -1) {
          pagename = dmFormType['地名更名'];
        }
        if (ItemType.indexOf('换') != -1) {
          pagename = dmFormType['地名换补'];
        }
        if (ItemType.indexOf('销名') != -1) {
          pagename = dmFormType['地名销名'];
        }
        if (ItemType.indexOf('受理') != -1) {
          pagename = dmFormType['地名受理'];
        }
        switch (Type) {
          case 'Settlement':
            activeTab = 'SettlementForm';
            break;
          case 'Building':
            activeTab = 'BuildingForm';
            break;
          case 'Road':
            activeTab = 'RoadForm';
            break;
          case 'Bridge':
            activeTab = 'BridgeForm';
            break;
          default:
            activeTab = 'SettlementForm'; // test
            break;
        }
        this.props.history.push({
          pathname: '/placemanage/toponymy/' + pagename,
          state: {
            activeTab: activeTab,
            id: PLID,
            blType: 'XCSQ_DM',
          },
        });
      }
    }
  }
  closeChoseForm() {
    this.setState({ showChoseForm: false });
  }
  // 网上申请-门牌-办理-新
  async setMpBlNewData(plid, pagename, activeTab) {
    let rt = await Post(url_GetPersonMPByID, { PLID: plid });
    rtHandle(rt, d => {
      // 新数据-根据-门牌证号查询
      this.props.history.push({
        pathname: '/placemanage/doorplate/' + pagename,
        state: {
          WSSQ_DATA: d,
          activeTab: activeTab,
          blType: 'WSSQ_MP_NEW',
        },
      });
    });
  }
  // 网上申请-门牌-办理-旧
  async setMpBlOldData(plid, pagename, activeTab, AddressCoding) {
    let rt = await Post(url_GetPersonMPByID, { PLID: plid });
    rtHandle(rt, d => {
      this.props.history.push({
        pathname: '/placemanage/doorplate/' + pagename,
        state: {
          AddressCoding: AddressCoding,
          activeTab: activeTab,
          blType: 'WSSQ_MP_OLD',
          WSSQ_DATA: d,
        },
      });
    });
  }
  // 网上申请-地名证明-办理-跳转到门牌查询
  async setDmzmBlData(plid, activeTab) {
    let rt = await Post(url_GetPersonMPByID, { PLID: plid });
    rtHandle(rt, d => {
      this.props.history.push({
        pathname: '/placemanage/doorplate/doorplatesearchnew',
        state: {
          WSSQ_DATA: d,
          activeTab: activeTab,
          blType: 'WSSQ_DMZM',
        },
      });
    });
  }
  // 网上申请-地名-办理-新
  async setDmBlNewData(plid, pagename, activeTab) {
    let rt = await Post(url_GetPersonDMByID, { PLID: plid });
    rtHandle(rt, d => {
      // 新数据
      this.props.history.push({
        pathname: '/placemanage/toponymy/' + pagename,
        state: {
          WSSQ_DATA: d,
          activeTab: activeTab,
          blType: 'WSSQ_DM_NEW',
        },
      });
    });
  }
  // 网上申请-地名-办理-旧
  async setDmBlOldData(plid, pagename, activeTab, DMCode) {
    let rt = await Post(url_GetPersonDMByID, { PLID: plid });
    rtHandle(rt, d => {
      this.props.history.push({
        pathname: '/placemanage/toponymy/' + pagename,
        state: {
          DMCode: DMCode,
          activeTab: activeTab,
          blType: 'WSSQ_DM_OLD',
          WSSQ_DATA: d,
        },
      });
    });
  }
  // 办理-现场申请-地名管理-地名受理
  /**
   *
   * @param {*} e 一条记录的数据
   * @param {*} type 类型：预命名、命名
   */
  onBl_Xcsq_Dmgl_Dmsl(e, type) {
    let { PostWay, Item, ItemType, ID, PLID, Type, AddressCoding, DMCode } = e;
    var pagename = '',
      activeTab = '';
    if (type == '预命名') {
      pagename = dmFormType['地名预命名'];
    }
    if (type == '命名') {
      pagename = dmFormType['地名命名'];
    }
    switch (Type) {
      case 'Settlement':
        activeTab = 'SettlementForm';
        break;
      case 'Building':
        activeTab = 'BuildingForm';
        break;
      case 'Road':
        activeTab = 'RoadForm';
        break;
      case 'Bridge':
        activeTab = 'BridgeForm';
        break;
      default:
        activeTab = 'SettlementForm'; // test
        break;
    }
    this.props.history.push({
      pathname: '/placemanage/toponymy/' + pagename,
      // pathname: '/placemanage/toponymy/toponymypreapproval',
      state: {
        id: PLID,
        activeTab: activeTab,
        blType: 'XCSQ_DM',
      },
    });
  }
  /**
   * 网上申请-门牌-选择弹框选择后-新数据/地名证明
   * @param {选中button} e
   * @param {事项类型} Item ：'门牌管理'、'地名证明'
   * @param {办事事项} ItemType
   * @param {当前操作} curOperate ：'办理 bl'、'删除 delete'
   * @param {*} id ：选中记录的ID，删除时用到
   * @param {*} plid ：选中记录的PLID，办理-查询时用到
   */
  choseMpType(e, Item, ItemType, curOperate, id, plid) {
    var pagename = '',
      activeTab = '',
      choseBtn = e.target.value;
    // 删除
    if (curOperate == 'delete') {
      this.deletePersonMP(id, this.SLUser, choseBtn);
    }
    // 办理
    if (curOperate == 'bl') {
      switch (choseBtn) {
        case 'Residence':
          activeTab = 'HDForm';
          break;
        case 'Road':
          activeTab = 'RDForm';
          break;
        case 'Country':
          activeTab = 'VGForm';
          break;
        default:
          break;
      }
      if (Item == '地名证明') {
        this.setDmzmBlData(plid, activeTab);
      }
      if (Item == '门牌管理') {
        if (
          ItemType == '个人申请门（楼）牌号码及门牌证' ||
          ItemType == '单位申请门（楼）牌号码及门牌证'
        ) {
          pagename = mpFormType['门牌编制'];
        }
        this.setMpBlNewData(plid, pagename, activeTab);
      }
    }
  }
  /**
   * 网上申请-地名-选择弹框选择后-新数据
   * @param {选中button} e
   * @param {事项类型} Item ：'地名管理'
   * @param {办事事项} ItemType
   * @param {当前操作} curOperate ：'办理 bl'、'删除 delete'
   * @param {*} id
   * @param {*} plid
   */
  choseDmType(e, Item, ItemType, curOperate, id, plid) {
    var pagename = '',
      activeTab = '',
      choseBtn = e.target.value;
    if (curOperate == 'delete') {
      // 删除
      this.deletePersonDM(id, this.SLUser, choseBtn);
    } else {
      // 办理
      if (ItemType.indexOf('预命名')) {
        pagename = dmFormType['地名预命名'];
      }
      if (ItemType.indexOf('命名')) {
        pagename = dmFormType['地名命名'];
      }
      switch (choseBtn) {
        case 'Settlement':
          activeTab = 'SettlementForm';
          break;
        case 'Building':
          activeTab = 'BuildingForm';
          break;
        case 'Road':
          activeTab = 'RoadForm';
          break;
        case 'Bridge':
          activeTab = 'BridgeForm';
          break;
        default:
          break;
      }
      this.setDmBlNewData(plid, pagename, activeTab);
    }
  }

  componentDidMount() {
    let user = getUser();
    this.SLUser = user.userName;
    this.onShowSizeChange(1);
  }

  render() {
    let {
      rows,
      loading,
      total,
      PageSize,
      PageNum, // 表格分页相关
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
      curOperate, // 当前操作
      DETAIL_INFO, // 详情中显示的信息
      rcdInfo, // 一条记录中的信息-办理时用
    } = this.state;
    return (
      <div className="ct-sc">
        <div className={st.ToDo}>
          {/* 查询条件 */}
          <div>
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
            <Button
              type="primary"
              onClick={e => {
                this.onShowSizeChange(1);
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
              {/* 查询结果-表格 */}
              <div className={st.rowsbody}>
                {loading ? (
                  <div className={st.loading}>
                    <Spin {...loading} />
                  </div>
                ) : null}
                <DataGrid
                  data={rows}
                  style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
                >
                  <GridColumn field="index" title="序号" align="center" width={60} />
                  <GridColumn
                    field="DistrictID"
                    title="行政区"
                    align="center"
                    width={60}
                    render={({ value, row, rowIndex }) => {
                      // 只显示到区，不显示市
                      if (value && value.indexOf('.') != -1) return value.split('.')[1];
                    }}
                  />
                  <GridColumn
                    field="NeighborhoodsID"
                    title="镇街道"
                    align="center"
                    width={100}
                    render={({ value, row, rowIndex }) => {
                      // 只显示到街道，不显示市跟区
                      if (value && value.indexOf('.') != -1) return value.split('.')[2];
                    }}
                  />
                  <GridColumn field="PostWay" title="提交方式" align="center" width={60} />
                  <GridColumn field="ApplicationWay" title="申请方式" align="center" width={80} />
                  <GridColumn field="Item" title="事项类型" align="center" width={60} />
                  <GridColumn field="ItemType" title="办事事项" align="center" width={150} />
                  <GridColumn field="ItemContent" title="事项内容" align="center" width={150} />
                  <GridColumn
                    field="ApplicationTime"
                    title="申办日期"
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
                              <Icon type="carry-out" title="办理" onClick={e => this.onBl(i)} />
                              <Icon type="delete" title="删除" onClick={e => this.onDelete(i)} />
                              <Icon type="bars" title="详情" onClick={e => this.onDetail(i)} />
                            </div>
                          );
                          if (
                            i.PostWay == '现场申请' &&
                            i.Item == '地名管理' &&
                            i.ItemType == '地名受理'
                          ) {
                            cz = (
                              <div className={st.rowbtns}>
                                <Popover
                                  placement="top"
                                  content={
                                    <div>
                                      <Icon
                                        type="edit"
                                        title="预命名"
                                        onClick={e => this.onBl_Xcsq_Dmgl_Dmsl(i, '预命名')}
                                      />
                                      &ensp;
                                      <Icon
                                        type="form"
                                        title="命名"
                                        onClick={e => this.onBl_Xcsq_Dmgl_Dmsl(i, '命名')}
                                      />
                                    </div>
                                  }
                                >
                                  <Icon type="carry-out" title="办理" />
                                </Popover>
                                <Icon type="delete" title="删除" onClick={e => this.onDelete(i)} />
                                <Icon type="bars" title="详情" onClick={e => this.onDetail(i)} />
                              </div>
                            );
                          }
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
              </div>
            </div>
          </div>
        </div>

        {/* Modal start */}

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

        {/* 选择弹窗 */}
        <Modal
          wrapClassName={st.blPopupForm}
          visible={showChoseForm}
          destroyOnClose={true}
          onCancel={this.closeChoseForm.bind(this)}
          title={'选择'}
          footer={null}
        >
          <Authorized>
            {rcdItem == '门牌管理' || rcdItem == '地名证明' ? (
              <Radio.Group
                className={st.btnGroup}
                onChange={e =>
                  this.choseMpType(e, rcdItem, rcdItemType, curOperate, rcdID, rcdPLID)
                }
              >
                {/* 门牌类型 Road/Country/Residence */}
                <Radio.Button value="Residence">住宅</Radio.Button>
                <Radio.Button value="Road">道路</Radio.Button>
                <Radio.Button value="Country">农村</Radio.Button>
              </Radio.Group>
            ) : (
              <Radio.Group
                className={st.btnGroup}
                onChange={e =>
                  this.choseDmType(e, rcdItem, rcdItemType, curOperate, rcdID, rcdPLID)
                }
              >
                {/* 地名类型 Settlement/Building/Road/Bridge */}
                <Radio.Button value="Settlement">居民点</Radio.Button>
                <Radio.Button value="Building">建筑物</Radio.Button>
                <Radio.Button value="Road">道路街巷</Radio.Button>
                <Radio.Button value="Bridge">桥梁</Radio.Button>
              </Radio.Group>
            )}
          </Authorized>
        </Modal>
        {/* Modal end */}
      </div>
    );
  }
}

export default withRouter(ToDo);
