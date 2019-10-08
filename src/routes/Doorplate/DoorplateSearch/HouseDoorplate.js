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
  message,
} from 'antd';
import HDForm from '../Forms/HDForm.js';
import Authorized from '../../../utils/Authorized4';
import st from './HouseDoorplate.less';

import LocateMap from '../../../components/Maps/LocateMap2.js';
import ProveForm from '../../ToponymyProve/ProveForm';
import MPZForm from '../../ToponymyProve/MPZForm';
import MPZForm_cj from '../../ToponymyProve/MPZForm_cj';
import ReportFormPrint from '../../../common/ReportFormPrint';

import {
  url_GetDistrictTreeFromData,
  url_GetCommunityNamesFromData,
  url_GetResidenceNamesFromData,
  url_SearchResidenceMP,
  url_CancelResidenceMP,
  url_GetConditionOfResidenceMP,
  url_ExportResidenceMP,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { getDistricts } from '../../../utils/utils.js';
import { divIcons } from '../../../components/Maps/icons';
import { success, error } from '../../../utils/notification';
import { DZZMPrint, MPZPrint, GetMPZPrint_cj, MPZPrint_pdfjs } from '../../../services/MP';
import { printMPZ_cj } from '../../../common/Print/LodopFuncs';

let mpIcon = divIcons.mp;
const InputGroup = Input.Group;

class HouseDoorplate extends Component {
  constructor(ps) {
    super(ps);

    // this.columns = GetHDColumns();
    this.edit = ps.edit;
    // this.columns.push({
    //   title: '操作',
    //   key: 'operation',
    //   width: 140,
    //   render: i => {
    //     return (
    //       <div className={st.rowbtns}>
    //         <Icon type="edit" title={this.edit ? '编辑' : '查看'} onClick={e => this.onEdit(i)} />
    //         <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
    //         {this.edit ? (
    //           <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
    //         ) : null}
    //         {this.edit ? (
    //           <Popover
    //             placement="left"
    //             content={
    //               <div>
    //                 <Button type="primary" onClick={e => this.onPrint0(i)}>
    //                   门牌证
    //                 </Button>&ensp;
    //                 <Button type="primary" onClick={e => this.onPrint1(i)}>
    //                   地名证明
    //                 </Button>
    //               </div>
    //             }
    //           >
    //             <Icon type="printer" title="打印" />
    //           </Popover>
    //         ) : null}
    //       </div>
    //     );
    //   },
    // });
  }

  // 动态查询条件
  queryCondition = {
    UseState: 1,
  };

  // 保存点击“查询”后的条件，供导出、翻页使用
  condition = {};

  state = {
    clearCondition: false,
    allChecked: false,
    showMPZForm: false,
    showMPZForm_cj: false,
    showProveForm: false,
    showLocateMap: false,
    showEditForm: false,
    rows: [],
    areas: [],
    total: 0,
    pageSize: 15,
    pageNumber: 1,
    loading: false,
    residences: [],
    residenceCondition: null,
    communities: [],
    communityCondition: null,
    selectedRows: [],
    queryDZct: 'StandardAddress',
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
    let rt = await Post(url_SearchResidenceMP, newCondition);
    this.setState({ loading: false });

    rtHandle(rt, data => {
      this.condition = newCondition;
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
    this.HD_ID = null;
    this.setState({ showEditForm: true });
  }

  // Pagenation发生变化时
  onShowSizeChange(pn, ps) {
    this.setState(
      {
        pageNumber: pn,
        pageSize: ps,
      },
      e => this.search(this.condition)
    );
  }

  closeEditForm() {
    this.setState({ showEditForm: false });
  }

  onEdit(e) {
    this.HD_ID = e.ID;
    this.setState({ showEditForm: true });
  }

  onLocate(e) {
    if (e.DYPositionY && e.DYPositionX) {
      this.HD_Lat = e.DYPositionY;
      this.HD_Lng = e.DYPositionX;
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
          await Post(url_CancelResidenceMP, { ID: cancelList }, e => {
            notification.success({ description: '注销成功！', message: '成功' });
            this.search(this.condition);
          });
        },
        onCancel() {},
        onCancel() {},
        onCancel() {},
      });
    } else {
      notification.warn({ description: '请选择需要注销的门牌！', message: '警告' });
    }
  }

  onPrintMPZ(ids) {
    if (ids && ids.length) {
      MPZPrint({
        ids: ids,
        mptype: '住宅门牌',
        CertificateType: '门牌证',
      });
      // MPZPrint_pdfjs(
      //   {
      //     ids: ids,
      //     mptype: '住宅门牌',
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

  // 插件批量打印门牌证
  onPrintMPZ_cj(ids) {
    if (ids && ids.length) {
      printMPZ_cj(ids, 'ResidenceMP');
    } else {
      error('请选择要打印的数据！');
    }
  }

  onPrintDZZM(ids) {
    if (ids && ids.length) {
      MPZPrint({
        ids: ids,
        mptype: '住宅门牌',
        CertificateType: '地址证明',
      });
    } else {
      error('请选择要打印的数据！');
    }
  }

  onPrint0(e) {
    this.HD_ID = e.ID;
    this.setState({ showMPZForm: true });
  }

  onPrint0_cj(e) {
    this.HD_ID = e.ID;
    this.setState({ showMPZForm_cj: true });
  }

  onPrint1(e) {
    this.HD_ID = e.ID;
    this.setState({ showProveForm: true });
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
      type: 1,
      DistrictID: DistrictID,
    });
    rtHandle(rt, d => {
      this.setState({
        communities: d,
        residences: [],
      });
    });
  }

  async getResidences(DistrictID, CommunityName) {
    let rt = await Post(url_GetResidenceNamesFromData, {
      DistrictID,
      CommunityName: CommunityName,
    });
    rtHandle(rt, d => {
      this.setState({ residences: d });
    });
  }

  async onExport() {
    await Post(url_GetConditionOfResidenceMP, this.condition, e => {
      window.open(url_ExportResidenceMP, '_blank');
    });
  }

  async componentDidMount() {
    let rt = await Post(url_GetDistrictTreeFromData, { type: 1 });
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
      showLocateMap,
      rows,
      areas,
      pageSize,
      pageNumber,
      loading,
      residences,
      residenceCondition,
      communities,
      communityCondition,
      selectedRows,
      queryDZct,
    } = this.state;

    let { edit } = this.props;

    return (
      <div className={st.HouseDoorplate}>
        {clearCondition ? null : (
          <div className={st.header}>
            <Cascader
              changeOnSelect={true}
              options={areas}
              onChange={e => {
                let CoutryID = e && e[0],
                  NeighborhoodsID = e && e[1];
                let DistrictID = NeighborhoodsID || CoutryID;

                this.queryCondition.DistrictID = DistrictID;
                this.queryCondition.CommunityName = undefined;
                this.queryCondition.ResidenceName = undefined;
                this.setState({
                  communities: [],
                  communityCondition: undefined,
                  residences: [],
                  residenceCondition: undefined,
                });

                this.getCommunities(DistrictID);
                this.getResidences(DistrictID, null);
              }}
              placeholder="请选择行政区"
              style={{ width: '160px' }}
              expandTrigger="hover"
            />
            <Select
              allowClear
              showSearch
              placeholder="村社区"
              value={communityCondition || undefined}
              style={{ width: '120px' }}
              onSearch={e => {
                this.queryCondition.CommunityName = e;
                this.queryCondition.ResidenceName = null;
                this.setState({ residences: [], residenceCondition: null, communityCondition: e });
              }}
              onSelect={e => {
                this.queryCondition.CommunityName = e;
                this.queryCondition.ResidenceName = null;
                this.setState({ residences: [], residenceCondition: null, communityCondition: e });
                this.getResidences(this.queryCondition.DistrictID, e);
              }}
              onChange={e => {
                this.queryCondition.CommunityName = e;
                this.queryCondition.ResidenceName = null;
                this.setState({ residences: [], residenceCondition: null, communityCondition: e });
                this.getResidences(this.queryCondition.DistrictID, e);
              }}
            >
              {communities.map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            <Select
              allowClear
              showSearch
              placeholder="小区名称"
              value={residenceCondition || undefined}
              style={{ width: '160px' }}
              onSearch={e => {
                this.queryCondition.ResidenceName = e;
                this.setState({ residenceCondition: e });
              }}
              onChange={e => {
                this.queryCondition.ResidenceName = e;
                this.setState({ residenceCondition: e });
              }}
            >
              {residences.map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            <Input
              placeholder="地址编码"
              style={{ width: '160px' }}
              onChange={e => (this.queryCondition.AddressCoding = e.target.value)}
            />
            <Input
              placeholder="产权人"
              style={{ width: '160px' }}
              onChange={e => (this.queryCondition.PropertyOwner = e.target.value)}
            />
            <Input
              placeholder="地址"
              style={{ width: '160px' }}
              onChange={e => (this.queryCondition.StandardAddress = e.target.value)}
            />
            {/*  <InputGroup compact>
              <Select
                defaultValue="StandardAddress"
                onChange={e => {
                  this.setState({ queryDZct: e });
                }}
              >
                <Option value="StandardAddress">标准地址</Option>
                <Option value="OriginalMPAddress">原门牌地址</Option>
                <Option value="FCZAddress">房产证地址</Option>
              </Select>
              <Input
                style={{ width: '160px' }}
                onChange={e => {
                  console.log(queryDZct);
                  if (queryDZct === 'StandardAddress')
                    this.queryCondition.StandardAddress = e.target.value;
                  else if (queryDZct === 'OriginalMPAddress')
                    this.queryCondition.OriginalMPAddress = e.target.value;
                  else if (queryDZct === 'FCZAddress')
                    this.queryCondition.FCZAddress = e.target.value;
                }}
              />
            </InputGroup>*/}

            <DatePicker
              onChange={e => {
                this.queryCondition.BZTime = e ? e.format('YYYY-MM-DD') : null;
              }}
              placeholder="编制时间"
              style={{ width: '120px' }}
            />
            {/* <Select
            placeholder="数据类型"
            style={{ width: '100px' }}
            defaultValue={this.queryCondition.UseState}
            onChange={e => (this.queryCondition.UseState = e)}
          >
            {sjlx.map(e => <Select.Option value={e.value}>{e.name}</Select.Option>)}
          </Select> */}
            <Button type="primary" icon="search" onClick={e => this.onSearchClick()}>
              搜索
            </Button>
            {/* {edit ? (
            <Button type="primary" icon="file-text" onClick={e => this.onNewMP()}>
              新增门牌
            </Button>
          ) : null} */}
            <Button
              type="primary"
              icon="retweet"
              onClick={e => {
                // this.condition = {};
                this.queryCondition = {
                  UseState: 1,
                };
                this.setState(
                  {
                    communities: [],
                    communityCondition: null,
                    residences: [],
                    residenceCondition: null,
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
            {/* <Button
            disabled={!(selectedRows && selectedRows.length)}
            type="primary"
            icon="environment-o"
          >
            定位
          </Button> */}
            {edit ? (
              <Button
                disabled={!(selectedRows && selectedRows.length)}
                type="primary"
                icon="rollback"
                onClick={e => {
                  this.onCancel(this.state.selectedRows);
                }}
              >
                注销
              </Button>
            ) : null}
            {edit ? (
              <Button
                onClick={e => {
                  this.onPrintMPZ(this.state.selectedRows);
                }}
                disabled={!(selectedRows && selectedRows.length)}
                type="primary"
                icon="printer"
              >
                打印门牌证
              </Button>
            ) : null}
            {edit ? (
              <Button
                onClick={e => {
                  this.onPrintMPZ_cj(this.state.selectedRows);
                }}
                disabled={!(selectedRows && selectedRows.length)}
                type="primary"
                icon="printer"
              >
                打印门牌证（插件）
              </Button>
            ) : null}
          </div>
        )}
        <div ref={e => (this.body = e)} className={st.body + ' ct-easyui-table'}>
          {loading ? (
            <div className={st.loading}>
              <Spin {...loading} />
            </div>
          ) : null}
          <DataGrid data={rows} style={{ height: '100%' }} onRowDblClick={i => this.onEdit(i)}>
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
            <GridColumn field="AddressCoding" title="地址编码" align="center" width={160} />
            <GridColumn field="CountyName" title="行政区" align="center" width={120} />
            <GridColumn field="NeighborhoodsName" title="镇街道" align="center" width={120} />
            <GridColumn field="CommunityName" title="村社区" align="center" width={120} />
            <GridColumn
              field="ResidenceName"
              title="小区名称"
              align="center"
              width={140}
              render={({ value, row, rowIndex }) => {
                return <span title={value}>{value}</span>;
              }}
            />
            <GridColumn
              field="StandardAddress"
              title="标准地址"
              halign="center"
              align="left"
              width={400}
              render={({ value, row, rowIndex }) => {
                return <span title={value}>{value}</span>;
              }}
            />
            <GridColumn
              field="PropertyOwner"
              title="产权人"
              align="center"
              width={260}
              render={({ value, row, rowIndex }) => {
                return <span title={value}>{value}</span>;
              }}
            />
            <GridColumn field="BZTime" title="编制日期" align="center" width={140} />
            <GridColumnGroup frozen align="right" width="120px">
              <GridHeaderRow>
                <GridColumn
                  field="operation"
                  title="操作"
                  align="center"
                  render={({ value, row, rowIndex }) => {
                    let i = row;
                    return (
                      <div className={st.rowbtns}>
                        <Icon
                          type="edit"
                          title={this.edit ? '编辑' : '查看'}
                          onClick={e => this.onEdit(i)}
                        />
                        <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
                        {this.edit ? (
                          <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
                        ) : null}
                        {this.edit ? (
                          <Popover
                            placement="left"
                            content={
                              <div>
                                <Button type="primary" onClick={e => this.onPrint0(i)}>
                                  门牌证
                                </Button>&ensp;
                                <Button type="primary" onClick={e => this.onPrint0_cj(i)}>
                                  门牌证（插件）
                                </Button>&ensp;
                                <Button type="primary" onClick={e => this.onPrint1(i)}>
                                  地名证明
                                </Button>
                              </div>
                            }
                          >
                            <Icon type="printer" title="打印" />
                          </Popover>
                        ) : null}
                      </div>
                    );
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
                this.setState({ selectedRows: e });
              },
            }}
            onRow={i => {
              return {
                onDoubleClick: () => {
                  this.onEdit(i);
                },
              };
            }}
            bordered={true}
            pagination={false}
            columns={this.columns}
            dataSource={rows}
            loading={loading}
            // scroll={{ x: true }}
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
        <Modal
          wrapClassName={st.hdform}
          visible={showEditForm}
          destroyOnClose={true}
          onCancel={this.closeEditForm.bind(this)}
          title={this.HD_ID ? '门牌维护' : '新增门牌'}
          footer={null}
        >
          <Authorized>
            <HDForm
              id={this.HD_ID}
              onSaveSuccess={e => this.search(this.condition)}
              onCancel={e => this.setState({ showEditForm: false })}
            />
          </Authorized>
        </Modal>
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
              if (this.HD_Lat && this.HD_Lng) {
                let center = [this.HD_Lat, this.HD_Lng];
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
          <ProveForm id={this.HD_ID} type="ResidenceMP" onCancel={this.closeProveForm.bind(this)} />
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
          <MPZForm id={this.HD_ID} type="ResidenceMP" onCancel={this.closeMPZForm.bind(this)} />
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
            id={this.HD_ID}
            type="ResidenceMP"
            onCancel={this.closeMPZForm_cj.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

export default HouseDoorplate;
