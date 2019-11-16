import React, { Component } from 'react';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';
import {
  notification,
  Cascader,
  Input,
  Button,
  Table,
  Pagination,
  Icon,
  Modal,
  Select,
  Popover,
  Checkbox,
  Spin,
  DatePicker,
} from 'antd';
import { withRouter } from 'react-router-dom';
import Authorized from '../../../utils/Authorized4';

import BuildingForm from '../Forms/BuildingForm.js';
import ToponymyBatchDelete from '../ToponymyBatchDelete/ToponymyBatchDelete.js';
// import { GetRDColumns } from '../DoorplateColumns.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import st from './BuildingDoorplate.less';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { sjlx, spztSelect, spzt } from '../../../common/enums.js';
import { getDistricts } from '../../../utils/utils.js';

import ProveForm from '../../ToponymyProve/ProveForm';
import MPZForm from '../../ToponymyProve/MPZForm';
import MPZForm_cj from '../../ToponymyProve/MPZForm_cj';
import {
  url_GetDistrictTreeFromData,
  url_GetCommunityNamesFromData,
  url_GetRoadNamesFromData,
  url_SearchBuildingDM,
  url_DeleteBuildingDM,
  url_GetConditionOfBuildingDM,
  url_DownloadBuildingDM,
} from '../../../common/urls.js';
import { divIcons } from '../../../components/Maps/icons';
import { DZZMPrint, MPZPrint, MPZPrint_pdfjs } from '../../../services/MP';
import { printMPZ_cj } from '../../../common/Print/LodopFuncs';

let mpIcon = divIcons.mp;

class BuildingDoorplate extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  // 搜索条件
  queryCondition = {
    DistrictID: null,
    KeyWord: '',
    Service: 0,
  };

  condition = {};

  state = {
    clearCondition: false,
    allChecked: false,
    showMPZForm: false,
    showMPZForm_cj: false,
    showProveForm: false,
    showLocateMap: false,
    showEditForm: false,
    showDetailForm: false,

    rows: [],
    areas: [],
    total: 0,
    pageSize: 15,
    pageNumber: 1,
    loading: false,
    roads: [],
    roadCondition: null,
    communities: [],
    communityCondition: null,
    selectedRows: [],
  };

  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }

  // 点击搜索按钮，从第一页开始
  onSearchClick() {
    this.setState(
      {
        pageNumber: 1,
      },
      e => this.search(this.queryCondition)
    );
  }

  // 搜索功能将传入查询条件，将数据渲染到表格
  async search(condition) {
    let { pageSize, pageNumber } = this.state;
    let newCondition = {
      ...condition,
      PageSize: pageSize,
      pageNum: pageNumber,
    };

    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    let rt = await Post(url_SearchBuildingDM, newCondition);
    this.setState({ loading: false });

    rtHandle(rt, data => {
      this.queryCondition = newCondition;
      this.setState({
        allChecked: false,
        selectedRows: [],
        total: data.Count,
        rows: data.Data.map((e, i) => {
          let cs = e.NeighborhoodsID ? e.NeighborhoodsID.split('.') : [];
          e.CountyName = cs[1];
          e.NeighborhoodsName = cs[2];
          e.index = i;
          e.key = e.ID;
          return e;
        }),
      });
    });
  }

  onNewMP() {
    this.RD_ID = null;
    this.setState({ showEditForm: true });
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

  onEdit(e) {
    this.id = e.ID;
    this.setState({ showEditForm: true });
  }
  closeEditForm() {
    this.setState({ showEditForm: false });
  }

  onDetail(e) {
    this.id = e.ID;
    this.setState({ showDetailForm: true });
  }
  closeDetailForm() {
    this.setState({ showDetailForm: false });
  }

  // onShowBatchDeleteForm(e) {
  //   this.BatchDeleteIDs = e;
  //   this.setState({ showBatchDeleteForm: true });
  // }
  // closeBatchDeleteForm() {
  //   this.setState({ showBatchDeleteForm: false });
  //   // 获取新的表格数据
  //   this.search(this.queryCondition);
  // }

  onLocate(e) {
    if (e.MPPositionX && e.MPPositionY) {
      this.RD_Lat = e.MPPositionY;
      this.RD_Lng = e.MPPositionX;
      this.setState({ showLocateMap: true });
    } else {
      notification.warn({ description: '该门牌尚未定位，请先进行定位！', message: '警告' });
    }
  }

  closeLocateMap() {
    this.setState({ showLocateMap: false });
  }

  onCancel(e) {
    let cancelList;
    if (e.ID) {
      cancelList = [e.ID];
    }
    if (e.length) {
      cancelList = e;
    }

    if (cancelList) {
      Modal.confirm({
        title: '提醒',
        content: '确定注销所选门牌？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          await Post(url_DeleteBuildingDM, { ID: cancelList, XMWH: '' }, e => {
            notification.success({ description: '注销成功！', message: '成功' });
            this.search(this.queryCondition);
          });
        },
        onCancel() {},
      });
      // this.onShowBatchDeleteForm(cancelList);
    } else {
      notification.warn({ description: '请选择需要注销的门牌！', message: '警告' });
    }
  }

  onPrintMPZ(ids) {
    if (ids && ids.length) {
      MPZPrint({
        ids: ids,
        mptype: '道路门牌',
        CertificateType: '门牌证',
      });
      // MPZPrint_pdfjs(
      //   {
      //     ids: ids,
      //     mptype: '道路门牌',
      //     CertificateType: '门牌证',
      //   },
      //   e => {
      //     window.open(window._g.p + '/pdfjs/web/viewer.html?file=' + window._g.p + '/' + e);
      //   }
      // );
    } else {
      error('请选择要打印的数据！');
    }
  }

  onPrintMPZ_cj(ids, PrintType) {
    if (ids && ids.length) {
      printMPZ_cj(ids, 'RoadMP', '门牌证');
    } else {
      error('请选择要打印的数据！');
    }
  }

  onPrintDZZM(ids) {
    if (ids && ids.length) {
      MPZPrint({
        ids: ids,
        mptype: '道路门牌',
        CertificateType: '地址证明',
      });
    } else {
      error('请选择要打印的数据！');
    }
  }

  onPrint0(e) {
    this.RD_ID = e.ID;
    this.setState({ showMPZForm: true });
  }

  onPrint0_cj(e) {
    this.RD_ID = e.ID;
    this.setState({ showMPZForm_cj: true });
  }

  onPrint1(e) {
    this.RD_ID = e.ID;
    this.setState({ showProveForm: true });
  }

  onPrint1_cj(e) {
    printMPZ_cj([e.ID], 'RoadMP', '地名证明');
  }

  closeMPZForm() {
    this.setState({ showMPZForm: false });
  }

  closeMPZForm_cj() {
    this.setState({ showMPZForm_cj: false });
  }

  closeProveForm() {
    this.setState({ showProveForm: false });
  }

  async getCommunities(DistrictID) {
    let rt = await Post(url_GetCommunityNamesFromData, {
      type: 2,
      DistrictID: DistrictID,
    });
    rtHandle(rt, d => {
      this.setState({
        communities: d,
      });
    });
  }

  async getRoads(DistrictID, CommunityName) {
    let rt = await Post(url_GetRoadNamesFromData, {
      type: 2,
      DistrictID,
      CommunityName: CommunityName,
    });
    rtHandle(rt, d => {
      this.setState({
        roads: d,
      });
    });
  }

  async onExport() {
    console.log(this.queryCondition);
    await Post(url_GetConditionOfBuildingDM, this.queryCondition, e => {
      window.open(url_DownloadBuildingDM, '_blank');
    });
  }

  async componentDidMount() {
    let rt = await Post(url_GetDistrictTreeFromData, { type: 2 });

    rtHandle(rt, d => {
      let areas = getDistricts(d);
      this.setState({ areas: areas });
    });

    this.search(this.queryCondition);
  }

  render() {
    let {
      clearCondition,
      total,
      showMPZForm,
      showMPZForm_cj,
      showProveForm,
      showEditForm,
      showDetailForm,
      showLocateMap,
      rows,
      areas,
      pageSize,
      pageNumber,
      loading,
      roads,
      roadCondition,
      communities,
      communityCondition,
      selectedRows,
    } = this.state;
    let { edit } = this;

    return (
      <div className={st.BuildingDoorplate}>
        {clearCondition ? null : (
          <div className={st.header}>
            <Cascader
              changeOnSelect={true}
              options={areas}
              onChange={e => {
                let CountryID = e && e[0],
                  NeighborhoodsID = e && e[1];
                let DistrictID = NeighborhoodsID || CountryID;

                this.queryCondition.DistrictID = DistrictID;
                this.queryCondition.CommunityName = null;
                this.queryCondition.KeyWord = null;

                this.setState({
                  communities: [],
                  roads: [],
                  communityCondition: undefined,
                  roadCondition: undefined,
                });

                this.getRoads(DistrictID, null);
                this.getCommunities(DistrictID);
              }}
              placeholder="请选择行政区"
              style={{ width: '200px' }}
              expandTrigger="hover"
            />
            {/* <Select
              allowClear
              showSearch
              placeholder="社区名"
              value={communityCondition || undefined}
              style={{ width: '140px' }}
              mode={'combobox'}
              onSearch={e => {
                this.queryCondition.CommunityName = e;
                this.queryCondition.KeyWord = undefined;
                this.setState({ roads: [], communityCondition: e, roadCondition: undefined });
              }}
              onSelect={e => {
                this.queryCondition.CommunityName = e;
                this.queryCondition.KeyWord = undefined;
                this.setState({ roads: [], communityCondition: e, roadCondition: undefined });
                this.getRoads(this.queryCondition.DistrictID, e);
              }}
              onChange={e => {
                this.queryCondition.CommunityName = e;
                this.queryCondition.KeyWord = undefined;
                this.setState({ roads: [], communityCondition: e, roadCondition: undefined });
                this.getRoads(this.queryCondition.DistrictID, e);
              }}
            >
              {communities.map(e => (
                <Select.Option value={e}>{e}</Select.Option>
              ))}
            </Select> */}
            <Select
              allowClear
              showSearch
              placeholder="地名名称"
              value={roadCondition || undefined}
              style={{ width: '180px' }}
              mode={'combobox'}
              onSearch={e => {
                this.queryCondition.KeyWord = e;
                this.setState({ roadCondition: e });
              }}
              onChange={e => {
                this.queryCondition.KeyWord = e;
                this.setState({ roadCondition: e });
              }}
            >
              {roads.map(e => (
                <Select.Option value={e}>{e}</Select.Option>
              ))}
            </Select>
            <Select
              placeholder="审批状态"
              style={{ width: '110px' }}
              defaultValue={0}
              onChange={e => (this.queryCondition.Service = e)}
            >
              {spztSelect.map(e => (
                <Select.Option value={e.value}>{e.name}</Select.Option>
              ))}
            </Select>
            <DatePicker
              onChange={e => {
                this.queryCondition.SLStartTime = e && e.format('YYYY-MM-DD HH:mm:ss.SSS');
              }}
              placeholder="受理日期（起）"
              style={{ width: '150px' }}
            />
            ~ &ensp;
            <DatePicker
              onChange={e => {
                this.queryCondition.SLEndTime = e && e.format('YYYY-MM-DD HH:mm:ss.SSS');
              }}
              placeholder="受理日期（止）"
              style={{ width: '150px' }}
            />
            <DatePicker
              onChange={e => {
                this.queryCondition.SPStartTime = e && e.format('YYYY-MM-DD HH:mm:ss.SSS');
              }}
              placeholder="审批日期（起）"
              style={{ width: '150px' }}
            />
            ~ &ensp;
            <DatePicker
              onChange={e => {
                this.queryCondition.SPEndTime = e && e.format('YYYY-MM-DD HH:mm:ss.SSS');
              }}
              placeholder="审批日期（止）"
              style={{ width: '150px' }}
            />
            <Button type="primary" icon="search" onClick={e => this.onSearchClick()}>
              搜索
            </Button>
            <Button
              type="primary"
              icon="retweet"
              onClick={e => {
                // this.queryCondition = {};
                this.queryCondition = {
                  DistrictID: null,
                  KeyWord: '',
                  Service: 0,
                };

                this.setState(
                  {
                    communities: [],
                    communityCondition: null,
                    roads: [],
                    roadCondition: null,
                    clearCondition: true,
                  },
                  e => {
                    this.setState({ clearCondition: false });
                  }
                );
              }}
            >
              条件清空
            </Button>
            {this.getEditComponent(
              <Button
                disabled={!(rows && rows.length)}
                type="primary"
                icon="export"
                onClick={this.onExport.bind(this)}
              >
                导出
              </Button>
            )}
            <Button
              disabled={!(selectedRows && selectedRows.length)}
              type="primary"
              icon="rollback"
              onClick={e => {
                this.onCancel(this.state.selectedRows, rows);
              }}
            >
              注销
            </Button>
          </div>
        )}
        <div className={st.body + ' ct-easyui-table'}>
          {loading ? (
            <div className={st.loading}>
              <Spin {...loading} />{' '}
            </div>
          ) : null}
          <DataGrid data={rows} style={{ height: '100%' }} onRowDblClick={e => this.onDetail(e)}>
            <GridColumnGroup frozen align="left" width="50px">
              <GridHeaderRow>
                <GridColumn
                  frozen
                  width={50}
                  align="center"
                  field="ck"
                  render={({ row }) => {
                    return (
                      <Checkbox
                        checked={row.selected}
                        onChange={e => {
                          let { checked } = e.target;
                          let { rows } = this.state;
                          rows = rows.slice();
                          rows.splice(row.index, 1, Object.assign({}, row, { selected: checked }));
                          let selectedRows = [];
                          let checkedRows = rows.filter(row => {
                            if (row.selected) {
                              selectedRows.push(row.ID);
                            }
                            return row.selected;
                          });
                          this.setState({
                            allChecked: rows.length === checkedRows.length,
                            rows: rows,
                            selectedRows: selectedRows,
                          });
                        }}
                      />
                    );
                  }}
                  header={() => (
                    <Checkbox
                      checked={this.state.allChecked}
                      onChange={e => {
                        let { checked } = e.target;
                        let { rows } = this.state;
                        let checkedRows = [];
                        rows = rows.map(r => {
                          checkedRows.push(r.ID);
                          return Object.assign({}, r, { selected: checked });
                        });
                        this.setState({
                          allChecked: checked,
                          rows: rows,
                          selectedRows: checked ? checkedRows : [],
                        });
                      }}
                    />
                  )}
                />
              </GridHeaderRow>
            </GridColumnGroup>
            <GridColumn
              field="CountyID"
              title="行政区"
              align="center"
              width={140}
              // render={({ value, row, rowIndex }) => {
              //   if (value != '') return value.split('.')[0] + value.split('.')[1];
              // }}
            />
            <GridColumn
              field="NeighborhoodsID"
              title="镇街道"
              align="center"
              width={140}
              // render={({ value, row, rowIndex }) => {
              //   return value.split('.')[2];
              // }}
            />
            <GridColumn
              field="Name"
              title="地名名称"
              align="center"
              width={140}
              render={({ value, row, rowIndex }) => {
                value = value == null ? row.Name1 : value;
                return <span title={value}>{value}</span>;
              }}
            />
            <GridColumn
              field="SLTime"
              title="受理日期"
              align="center"
              width={140}
              // render={({ value, row, rowIndex }) => {
              //   if (value != null) return moment(value).format('YYYY-MM-DD');
              // }}
            />
            <GridColumn
              field="SPTime"
              title="审批日期"
              align="center"
              width={140}
              render={({ value, row, rowIndex }) => {
                if (value != null) return moment(value).format('YYYY-MM-DD');
              }}
            />
            <GridColumn
              field="Service"
              title="审批状态"
              align="center"
              width={100}
              render={({ value, row, rowIndex }) => {
                if (value > 0) return spzt[value];
              }}
            />
            <GridColumnGroup frozen align="right" width="150px">
              <GridHeaderRow>
                <GridColumn
                  field="operation"
                  title="操作"
                  align="center"
                  render={({ value, row, rowIndex }) => {
                    let i = row;
                    // 待审批1 :预命名、命名
                    if (i.Service == 1) {
                      return (
                        <div className={st.rowbtns}>
                          <Icon
                            type="edit"
                            title={'预命名'}
                            onClick={e =>
                              this.props.history.push({
                                pathname: '/placemanage/toponymy/toponymypreapproval',
                                state: {
                                  id: i.ID,
                                  activeTab: 'BuildingForm',
                                },
                              })
                            }
                          />
                          <Icon
                            type="form"
                            title={'命名'}
                            onClick={e =>
                              this.props.history.push({
                                pathname: '/placemanage/toponymy/toponymyapproval',
                                state: {
                                  id: i.ID,
                                  activeTab: 'BuildingForm',
                                },
                              })
                            }
                          />
                        </div>
                      );
                    }
                    // 已审核2 :命名
                    if (i.Service == 2) {
                      return (
                        <div className={st.rowbtns}>
                          <Icon
                            type="form"
                            title={'命名'}
                            onClick={e =>
                              this.props.history.push({
                                pathname: '/placemanage/toponymy/toponymyapproval',
                                state: {
                                  id: i.ID,
                                  activeTab: 'BuildingForm',
                                },
                              })
                            }
                          />
                        </div>
                      );
                    }
                    // 已审批3 :详情、补换、更名、注销
                    if (i.Service == 3) {
                      return (
                        <div className={st.rowbtns}>
                          <Icon type="bars" title={'详情'} onClick={() => this.onDetail(i)} />
                          <Icon
                            type="file-text"
                            title={'补换'}
                            onClick={e =>
                              this.props.history.push({
                                pathname: '/placemanage/toponymy/toponymyreplace',
                                state: {
                                  id: i.ID,
                                  activeTab: 'BuildingForm',
                                },
                              })
                            }
                          />
                          <Icon
                            type="retweet"
                            title={'更名'}
                            onClick={e =>
                              this.props.history.push({
                                pathname: '/placemanage/toponymy/toponymyrename',
                                state: {
                                  id: i.ID,
                                  activeTab: 'BuildingForm',
                                },
                              })
                            }
                          />
                          <Icon
                            type="delete"
                            title={'注销'}
                            onClick={e =>
                              this.props.history.push({
                                pathname: '/placemanage/toponymy/toponymycancel',
                                state: {
                                  id: i.ID,
                                  activeTab: 'BuildingForm',
                                },
                              })
                            }
                          />
                        </div>
                      );
                    }
                    // 已退件4 、已注销5 :详情
                    if (i.Service == 4 || i.Service == 5) {
                      return (
                        <div className={st.rowbtns}>
                          <Icon type="bars" title={'详情'} onClick={() => this.onDetail(i)} />
                        </div>
                      );
                    }
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
          {/* <Table
            rowSelection={{
              key: 'ID',
              selectedRowKeys: selectedRows,
              onChange: e => {
                console.log(e);
                this.setState({ selectedRows: e });
              },
            }}
            bordered={true}
            pagination={false}
            columns={this.columns}
            dataSource={rows}
            loading={loading}
            onRow={i => {
              return {
                onDoubleClick: () => {
                  this.onEdit(i);
                },
              };
            }}
          /> */}
        </div>
        <div className={st.footer}>
          <Pagination
            showSizeChanger
            // 行数发生变化，默认从第一页开始
            onShowSizeChange={(page, size) => this.onShowSizeChange(1, size)}
            current={pageNumber}
            pageSize={pageSize}
            total={total}
            pageSizeOptions={[15, 25, 50, 100]}
            onChange={this.onShowSizeChange.bind(this)}
            showTotal={(total, range) =>
              total ? `共：${total} 条，当前：${range[0]}-${range[1]} 条` : ''
            }
          />
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
            <BuildingForm
              FormType="DMXQ"
              showDetailForm={true}
              id={this.id}
              onSaveSuccess={e => this.search(this.condition)}
              onCancel={e => this.setState({ showDetailForm: false })}
            />
          </Authorized>
        </Modal>
        {/* 批量注销 */}
        {/* <Modal
          wrapClassName={st.hdPopupForm}
          visible={showBatchDeleteForm}
          destroyOnClose={true}
          onCancel={this.closeBatchDeleteForm.bind(this)}
          title={'批量注销'}
          footer={null}
        >
          <Authorized>
            <ToponymyBatchDelete
              showBatchDeleteForm={true}
              ids={this.BatchDeleteIDs}
              current="BuildingForm"
              onCancel={this.closeBatchDeleteForm.bind(this)}
            />
          </Authorized>
        </Modal> */}
        <Modal
          wrapClassName={st.locatemap}
          visible={showLocateMap}
          destroyOnClose={true}
          onCancel={this.closeLocateMap.bind(this)}
          title="定位"
          footer={null}
        >
          <LocateMap
            onMapReady={lm => {
              if (this.RD_Lat && this.RD_Lng) {
                let center = [this.RD_Lat, this.RD_Lng];
                L.marker(center, { icon: mpIcon }).addTo(lm.map);
                lm.map.setView(center, 18);
              }
            }}
          />
        </Modal>
        <Modal
          visible={showProveForm}
          bodyStyle={{ padding: '10px 20px 0' }}
          destroyOnClose={true}
          onCancel={this.closeProveForm.bind(this)}
          title="开具地名证明"
          footer={null}
          width={800}
        >
          <ProveForm id={this.RD_ID} type="RoadMP" onCancel={this.closeProveForm.bind(this)} />
        </Modal>
        <Modal
          visible={showMPZForm}
          bodyStyle={{ padding: '10px 20px 0' }}
          destroyOnClose={true}
          onCancel={this.closeMPZForm.bind(this)}
          title="打印门牌证"
          footer={null}
          width={800}
        >
          <MPZForm id={this.RD_ID} type="RoadMP" onCancel={this.closeMPZForm.bind(this)} />
        </Modal>
        <Modal
          visible={showMPZForm_cj}
          bodyStyle={{ padding: '10px 20px 0' }}
          destroyOnClose={true}
          onCancel={this.closeMPZForm_cj.bind(this)}
          title="设置原门牌证地址【打印门牌证】"
          footer={null}
          width={800}
        >
          <MPZForm_cj
            id={this.RD_ID}
            type="RoadMP"
            onCancel={this.closeMPZForm_cj.bind(this)}
            onPrint={this.closeMPZForm_cj.bind(this)}
          />
        </Modal>
        {/* Modal end */}
      </div>
    );
  }
}

export default withRouter(BuildingDoorplate);
