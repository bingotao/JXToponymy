import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';
import { Select, Button, Pagination, Spin, Icon, Tag, Modal, Alert, Radio, Row, notification } from 'antd';
import st from './ToDo.less';
import {
  url_GetDistrictTreeFromDistrict, url_ExportBusinessTJ,
  url_GetPersonDMByID, url_GetPersonMPByID,
  url_DeletePersonMP, url_DeletePersonDM,
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
  Tjfs, Sqfs, Sxlx,
  Bssx_mpgl, Bssx_dmzm, Bssx_dmgl,
  mpFormType, dmFormType,
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
    choseItem: '',

    total: 0,
    PageSize: 10,
    PageNum: 1,

    loading: false,
    rows: [],
  };
  condition = {
    PageSize: 10,
    PageNum: 1,
    State: 0, // 待办
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

  // 删除-退件
  onDelete(e) {
    Modal.confirm({
      title: '提醒',
      content: '是否确认退件？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        let { PostWay, Item, ItemType, Type, ID } = e;
        var PostType = Item.indexOf('门牌') != -1 ? '门牌' : '地名';
        if (PostWay == '网上申请') {
          if (Type.length <= 0) {
            // 跳出选择弹窗
            this.setState({
              showChoseForm: true, choseItem: Item, choseItemType: ItemType,
              WSSQ_DATA: e, curOperate: 'delete', ID: ID
            });
          } else {
            if (PostType == '门牌') {
              // 门牌
              this.deletePersonMP(ID, this.SLUser, Type);
            } else {
              // 地名
              this.deletePersonDM(ID, this.SLUser, Type);
            }
          }
        }
        if (PostWay == '现场申请') { }
      }
    });

  }

  // 网上申请-门牌-退件
  async deletePersonMP(ID, SLUser, Type) {
    let rt = await Post(url_DeletePersonMP, { ID: ID, SLTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), SLUser: SLUser, Type: Type });
    rtHandle(rt, d => {
      notification.success({ description: '退件成功！', message: '成功' });
    });
  }
  // 网上申请-地名-退件
  async deletePersonDM(ID, SLUser, Type) {
    let rt = await Post(url_DeletePersonDM, { ID: ID, SLTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), SLUser: SLUser, Type: Type });
    rtHandle(rt, d => {
      notification.success({ description: '退件成功！', message: '成功' });
    });
  }

  // 详情 Modal
  onDetail(e) {
    this.ID = e.ID;
    this.PLID = e.PLID;
    this.PostWay = e.PostWay;
    this.Detail_Rcd_Info = e;
    this.PostType = e.Item.indexOf('门牌') != -1 ? '门牌' : '地名';
    this.Type = e.Type;
    if (this.PostWay == '网上申请') {
      if (this.PostType == '门牌') {
        this.setMpDetail(this.PLID);
      } else {
        this.setDmDetail(this.PLID);

      }
    } else {
      this.setState({ showDetailForm: true });
    }
  }
  closeDetailForm() {
    this.setState({ showDetailForm: false });
  }
  // 网上申请-门牌-详情
  async setMpDetail(id) {
    let rt = await Post(url_GetPersonMPByID, { PLID: id });
    rtHandle(rt, d => {
      this.setState({ showDetailForm: true, DETAIL: d });
    });
  }
  // 网上申请-门牌-办理
  async setMpBlData(id, pagename, activeTab) {
    let rt = await Post(url_GetPersonMPByID, { PLID: id });
    rtHandle(rt, d => {
      // 新数据-根据-门牌证号查询
      this.props.history.push({
        pathname: '/placemanage/doorplate/' + pagename,
        state: {
          WSSQ_DATA: d,
          activeTab: activeTab,
          blType: 'WSSQ_MP_NEW'
        },
      });
    });
  }
  // 网上申请-地名-详情
  async setDmDetail(id) {
    let rt = await Post(url_GetPersonDMByID, { PLID: id });
    rtHandle(rt, d => {
      this.setState({ showDetailForm: true, DETAIL: d });
    });
  }
  // 网上申请-地名-办理-新
  async setDmBlNewData(id, pagename, activeTab) {
    let rt = await Post(url_GetPersonDMByID, { PLID: id });
    rtHandle(rt, d => {
      // 新数据
      this.props.history.push({
        pathname: '/placemanage/toponymy/' + pagename,
        state: {
          WSSQ_DATA: d,
          activeTab: activeTab,
          blType: 'WSSQ_DM_NEW'
        },
      });
    });
  }

  // 办理 Modal
  onBl(e) {
    if (e.PostWay == '网上申请') {
      // this.WSSQ_DATA = e.WSSQ_DATA;
      var PostType = e.Item.indexOf('门牌') != -1 ? '门牌' : '地名';
      if (PostType == '门牌') {
        // 门牌
        if (e.ItemType == '个人申请门（楼）牌号码及门牌证' || e.ItemType == '单位申请门（楼）牌号码及门牌证') {
          // 1.门牌-新数据-弹出选择弹框-选择后-跳转到编制
          this.PLID = e.PLID;
          this.setState({ showChoseForm: true, choseItem: e.Item, choseItemType: e.ItemType, WSSQ_DATA: e });
        } else {
          var pagename = '', activeTab = '';
          // 2.门牌-老数据-不选-根据ItemType+Type-跳转到变更、换补、注销或地名证明
          if (e.ItemType.indexOf('变更') != -1) {
            pagename = mpFormType['门牌变更'];
          }
          if (e.ItemType.indexOf('换补') != -1) {
            pagename = mpFormType['门牌换补'];
          }
          if (e.ItemType.indexOf('注销') != -1) {
            pagename = mpFormType['门牌注销'];
          }
          if (e.ItemType.indexOf('证明') != -1) {
            pagename = mpFormType['门牌证明'];
          }
          switch (e.Type) {
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
              AddressCoding: e.AddressCoding,
              activeTab: activeTab,
              blType: 'WSSQ_MP_OLD',
              WSSQ_DATA: e,
            },
          });
        }
      } else {
        // 地名
        if (e.ItemType.indexOf('命名') != -1 || e.ItemType.indexOf('预命名') != -1) {
          // 新数据
          this.PLID = e.PLID;
          this.setState({ showChoseForm: true, choseItem: e.Item, choseItemType: e.ItemType, WSSQ_DATA: e });
        } else {
          // 旧数据
          var pagename = '', activeTab = '';
          if (e.ItemType.indexOf('更名') != -1) {
            pagename = dmFormType['地名更名'];
          }
          if (e.ItemType.indexOf('换') != -1) {
            pagename = dmFormType['地名换补'];
          }
          if (e.ItemType.indexOf('销名') != -1) {
            pagename = dmFormType['地名销名'];
          }
          if (e.ItemType.indexOf('受理') != -1) {
            pagename = dmFormType['地名受理'];
          }

          switch (e.Type) {
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
              DMCode: e.DMCode,
              activeTab: activeTab,
              blType: 'WSSQ_DM_OLD',
              // WSSQ_DATA: e,
            },
          });


        }
      }
    }
    if (e.PostWay == '现场申请') {
      var PostType = e.Item.indexOf('门牌') != -1 ? '门牌' : '地名';
      if (PostType == '门牌') {
        // this.props.history.push({
        //   pathname: '/placemanage/doorplate/' + pagename,
        //   state: {
        //     AddressCoding: e.AddressCoding,
        //     activeTab: activeTab,
        //     blType: 'WSSQ_MP_OLD',
        //     WSSQ_DATA: e,
        //   },
        // });
      }
      if (PostType == '地名') {

      }
    }

  }
  closeChoseForm() {
    this.setState({ showChoseForm: false });
  }

  // 网上申请-门牌-选择弹框选择后-新数据
  choseMpType(e, ItemType, curOperate, ID) {
    var pagename = '', activeTab = '', choseBtn = e.target.value;
    if (curOperate == 'delete') {
      // 删除
      this.deletePersonMP(ID, this.SLUser, choseBtn);
    } else {
      // 办理
      if (ItemType == '个人申请门（楼）牌号码及门牌证' || ItemType == '单位申请门（楼）牌号码及门牌证') {
        pagename = mpFormType['门牌编制'];
      }
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
      this.setMpBlData(this.PLID, pagename, activeTab);
    }
  }
  // 网上申请-地名-选择弹框选择后-新数据
  choseDmType(e, ItemType, curOperate, ID) {
    var pagename = '', activeTab = '', choseBtn = e.target.value;
    if (curOperate == 'delete') {
      // 删除
      this.deletePersonDM(ID, this.SLUser, choseBtn);
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
      this.setDmBlNewData(this.PLID, pagename, activeTab);
    }
  }

  componentDidMount() {
    // this.search();
    let user = getUser();
    this.SLUser = user.userName;
  }

  render() {
    let {
      rows, loading,
      total, PageSize, PageNum,
      PostWay, ApplicationWay, Item,
      showDetailForm, showChoseForm, choseItem, choseItemType, curOperate, ID,
      DETAIL,
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
                  <GridColumn field="NeighborhoodsID" title="镇街道" align="center" width={100} />
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
                          return (
                            <div className={st.rowbtns}>
                              <Icon type="carry-out" title="办理" onClick={e => this.onBl(i)} />
                              <Icon type="delete" title="删除" onClick={e => this.onDelete(i)} />
                              <Icon type="bars" title="详情" onClick={e => this.onDetail(i)} />
                            </div>
                          );
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
              {
                this.PostWay == '现场申请' && this.PostType == '门牌' && this.Type == 'Road' ? (
                  <RDFormNew
                    FormType="MPXQ"
                    showDetailForm={true}
                    id={this.ID}
                    PostWay={this.PostWay}
                    PostType={this.PostType}
                    Type={this.Type}
                    onSaveSuccess={e => this.search(this.condition)}
                    onCancel={e => this.setState({ showDetailForm: false })}
                  />
                ) : null
              }
              {
                this.PostWay == '现场申请' && this.PostType == '门牌' && this.Type == 'Country' ? (
                  <VGFormNew
                    FormType="MPXQ"
                    showDetailForm={true}
                    id={this.ID}
                    PostWay={this.PostWay}
                    PostType={this.PostType}
                    Type={this.Type}
                    onSaveSuccess={e => this.search(this.condition)}
                    onCancel={e => this.setState({ showDetailForm: false })}
                  />
                ) : null
              }
              {
                this.PostWay == '现场申请' && this.PostType == '门牌' && this.Type == 'Residence' ? (
                  <HDFormNew
                    FormType="MPXQ"
                    showDetailForm={true}
                    id={this.ID}
                    PostWay={this.PostWay}
                    PostType={this.PostType}
                    Type={this.Type}
                    onSaveSuccess={e => this.search(this.condition)}
                    onCancel={e => this.setState({ showDetailForm: false })}
                  />
                ) : null
              }
              {
                this.PostWay == '现场申请' && this.PostType == '地名' && this.Type == 'Settlement' ? (
                  <SettlementForm
                    FormType="DMXQ"
                    showDetailForm={true}
                    id={this.ID}
                    PostWay={this.PostWay}
                    PostType={this.PostType}
                    Type={this.Type}
                    onSaveSuccess={e => this.search(this.condition)}
                    onCancel={e => this.setState({ showDetailForm: false })}
                  />
                ) : null
              }
              {
                this.PostWay == '现场申请' && this.PostType == '地名' && this.Type == 'Building' ? (
                  <BuildingForm
                    FormType="DMXQ"
                    showDetailForm={true}
                    id={this.ID}
                    PostWay={this.PostWay}
                    PostType={this.PostType}
                    Type={this.Type}
                    onSaveSuccess={e => this.search(this.condition)}
                    onCancel={e => this.setState({ showDetailForm: false })}
                  />
                ) : null
              }
              {
                this.PostWay == '现场申请' && this.PostType == '地名' && this.Type == 'Road' ? (
                  <RoadForm
                    FormType="DMXQ"
                    showDetailForm={true}
                    id={this.ID}
                    PostWay={this.PostWay}
                    PostType={this.PostType}
                    Type={this.Type}
                    onSaveSuccess={e => this.search(this.condition)}
                    onCancel={e => this.setState({ showDetailForm: false })}
                  />
                ) : null
              }
              {
                this.PostWay == '现场申请' && this.PostType == '地名' && this.Type == 'Bridge' ? (
                  <BridgeForm
                    FormType="DMXQ"
                    showDetailForm={true}
                    id={this.ID}
                    PostWay={this.PostWay}
                    PostType={this.PostType}
                    Type={this.Type}
                    onSaveSuccess={e => this.search(this.condition)}
                    onCancel={e => this.setState({ showDetailForm: false })}
                  />
                ) : null
              }
              {/* 网上申请 */}
              {
                this.PostWay == '网上申请' ? (
                  <div>
                    <Detail
                      PostType={this.PostType}
                      DETAIL={DETAIL}
                    />
                    <Row>
                      <Button.Group
                        style={{ marginTop: 10, width: '100%' }}
                      >
                        <Button icon='carry-out'
                          onClick={e => {
                            this.setState({ showDetailForm: false });
                            this.onBl(this.Detail_Rcd_Info);
                          }}
                          style={{ width: '50%' }}
                        >
                          办理
                        </Button>
                        <Button icon='delete'
                          onClick={e => {
                            this.setState({ showDetailForm: false });
                            this.onDelete(this.Detail_Rcd_Info);
                          }}
                          style={{ width: '50%' }}
                        >
                          退件
                        </Button>
                      </Button.Group>
                    </Row>
                  </div>
                ) : null
              }
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
            {choseItem.indexOf('门牌') != -1 ? (
              <Radio.Group className={st.btnGroup} onChange={e => this.choseMpType(e, choseItemType, curOperate, ID)}>
                {/* 门牌类型 */}
                {/* Road/Country/Residence */}
                <Radio.Button value="Residence">住宅</Radio.Button>
                <Radio.Button value="Road">道路</Radio.Button>
                <Radio.Button value="Country">农村</Radio.Button>
              </Radio.Group>
            ) : (
                <Radio.Group className={st.btnGroup} onChange={e => this.choseDmType(e, choseItemType, curOperate, ID)}>
                  {/* 地名类型 */}
                  {/* Settlement/Building/Road/Bridge */}
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
