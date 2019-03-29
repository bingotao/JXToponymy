import React, { Component } from 'react';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';

import {
  notification,
  Select,
  Input,
  Cascader,
  Button,
  DatePicker,
  Pagination,
  Icon,
  Modal,
  Popconfirm,
  Popover,
  Checkbox,
  Spin,
} from 'antd';
import st from './GPSearch.less';

import GPForm from '../Forms/GPForm.js';
import GPRepair from '../Forms/GPRepair.js';
import GPRepairList from '../Forms/GPRepairList.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';

import {
  baseUrl,
  url_GetDistrictTreeFromDistrict,
  url_GetRPBZDataFromData,
  url_SearchRP,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import {
  getRoadNamesFromData,
  getCommunityNamesFromData,
  getIntersectionFromData,
} from '../../../services/Common';
import { getDistricts } from '../../../utils/utils.js';
import { divIcons } from '../../../components/Maps/icons';
import { cancelRP, upRPDownloadCondition, upQRDownloadCondition } from '../../../services/RP';
import Authorized from '../../../utils/Authorized4';

let lpIcon = divIcons.lp;

class GPSearch extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  state = {
    resetCondition: false,
    allChecked: false,
    showGPForm: false,
    showGPRepair: false,
    showLocateMap: false,
    selectedRows: [],
    areas: [],
    total: 0,
    rows: [],
    pageSize: 15,
    pageNum: 1,
    loading: false,
    communities: [],
    CommunityName: undefined,
    directions: [],
    Direction: undefined,
    intersections: [],
    Intersection: undefined,
    manufacturers: [],
    districts: [],
    roads: [],
    RoadName: undefined,
  };

  condition = {};

  columns = [
    // { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    // { title: '二维码编号', align: 'center', dataIndex: 'Code', key: 'Code' },
    { title: '行政区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    {
      title: '镇街道',
      align: 'center',
      dataIndex: 'NeighborhoodsName',
      key: 'NeighborhoodsName',
    },
    { title: '道路名称', align: 'center', dataIndex: 'RoadName', key: 'RoadName' },
    { title: '设置路口', align: 'center', dataIndex: 'Intersection', key: 'Intersection' },
    { title: '设置方位', align: 'center', dataIndex: 'Direction', key: 'Direction' },
    { title: '设置时间', align: 'center', dataIndex: 'BZTime', key: 'BZTime' },
    { title: '样式', align: 'center', dataIndex: 'Model', key: 'Model' },
    { title: '材质', align: 'center', dataIndex: 'Material', key: 'Material' },
    { title: '规格', align: 'center', dataIndex: 'Size', key: 'Size' },
    { title: '维修次数', align: 'center', dataIndex: 'RepairedCount', key: 'RepairedCount' },
    {
      title: '操作',
      width: 180,
      key: 'operation',
      render: i => {
        return (
          <div className={st.rowbtns}>
            {i.CodeFile ? (
              <Popover
                placement="left"
                content={
                  <div className={st.codefile}>
                    <img
                      alt="二维码无法显示，请联系管理员"
                      src={baseUrl + '/' + i.CodeFile.RelativePath}
                    />
                    <a href={baseUrl + '/' + i.CodeFile.RelativePath} download={i.Code}>
                      下载二维码（{i.Code}）
                    </a>
                  </div>
                }
                title={null}
              >
                <Icon type="qrcode" title="二维码" />
              </Popover>
            ) : null}

            <Icon type="edit" title={this.edit ? '编辑' : '查看'} onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            {this.getEditComponent(
              <Icon type="tool" title="维护" onClick={e => this.onRepair(i)} />
            )}
            <Icon type="bars" title="维修记录" onClick={e => this.onRepairList(i)} />
            {this.getEditComponent(
              <Popconfirm
                title="确定注销该路牌？"
                placement="left"
                onConfirm={e => this.onCancel(i)}
              >
                <Icon type="rollback" title="注销" />
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  async onExport() {
    await upRPDownloadCondition(this.condition, e => {
      window.open(`${baseUrl}/RPSearch/ExportRP`, '_blank');
    });
  }

  onEdit(i) {
    this.formId = i.ID;
    this.setState({ showGPForm: true });
  }

  onNewLP() {
    this.formId = null;
    this.setState({ showGPForm: true });
  }

  onLocate(i) {
    if (i.Lng && i.Lat) {
      this.Lng = i.Lng;
      this.Lat = i.Lat;
      this.showLocateMap();
    } else {
      notification.warn({ description: '该路牌无位置信息！', message: '警告' });
    }
  }

  onRepair(i) {
    this.rpId = i.ID;
    this.setState({ showGPRepair: true });
  }

  async onCancel(i) {
    await cancelRP({ IDs: [i.ID] }, e => {
      notification.success({ description: '路牌已注销！', message: '成功' });
      this.onShowSizeChange();
    });
  }

  onRepairList(i) {
    this.rpId = i.ID;
    this.setState({ showGPRepairList: true });
  }

  onShowSizeChange(pn, ps) {
    let page = {};
    if (pn) page.pageNum = pn;
    if (ps) page.pageSize = ps;
    this.setState(page, e => this.search(this.condition));
  }

  closeLocateMap() {
    this.setState({ showLocateMap: false });
  }

  showLocateMap() {
    this.setState({ showLocateMap: true });
  }

  downloadQRByRange() {
    if (this.qrStart && this.qrEnd) {
      window.open(
        `${baseUrl}/RPSearch/DownloadQRCodeJpgsByCode?startCode=${this.qrStart}&endCode=${
          this.qrEnd
        }`,
        '_blank'
      );
    } else {
      notification.warn({ description: '请设置起始路牌二维码起始编号！', message: '警告' });
    }
  }

  async downloadQRByIds() {
    let { selectedRows } = this.state;
    if (!selectedRows || !selectedRows.length) {
      notification.warn({ description: '尚未选择任何路牌！', message: '警告' });
      return;
    } else {
      await upQRDownloadCondition({ rpids: selectedRows }, e => {
        window.open(`${baseUrl}/RPSearch/DownloadQRCodeJpgs`, '_blank');
      });
    }
  }

  async search(condition) {
    let { pageSize, pageNum } = this.state;
    let newCondition = {
      ...condition,
      PageSize: pageSize,
      pageNum: pageNum,
    };

    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    let rt = await Post(url_SearchRP, newCondition, data => {
      this.condition = newCondition;
      this.setState({
        selectedRows: [],
        total: data.Count,
        rows: data.Data.map((e, i) => {
          e.key = e.ID;
          e.index = i;
          return e;
        }),
      });
    });
    this.setState({ loading: false });
  }

  async getRoads(CommunityName, CountyID, NeighborhoodsID) {
    await getRoadNamesFromData(
      { type: 5, CommunityName: CommunityName, CountyID, NeighborhoodsID },
      d => {
        this.setState({ roads: d });
      }
    );
  }

  async getIntersections(roadName) {
    await getIntersectionFromData({ RoadName: roadName }, d => {
      this.setState({ intersections: d });
    });
  }

  getCommunities(jd) {
    getCommunityNamesFromData({ type: 5, DistrictID: jd }, d => {
      this.setState({ communities: d });
    });
  }

  async getInitData() {
    await Post(url_GetRPBZDataFromData, null, e => {
      this.setState({
        directions: e ? e.Direction : [],
        manufacturers: e ? e.Manufacturers : [],
      });
    });
  }

  componentDidMount() {
    this.getDistricts();
    this.getInitData();
    this.search(this.condition);
  }

  render() {
    let {
      communities,
      resetCondition,
      showGPForm,
      showGPRepair,
      showLocateMap,
      showGPRepairList,
      rows,
      total,
      pageSize,
      pageNum,
      loading,
      CommunityName,
      directions,
      intersections,
      Intersection,
      manufacturers,
      roads,
      RoadName,
      districts,
    } = this.state;

    return (
      <div className={st.GPSearch}>
        {resetCondition ? null : (
          <div className={st.header}>
            <Cascader
              allowClear
              changeOnSelect
              expandTrigger="hover"
              options={districts}
              placeholder="行政区"
              onChange={(a, b) => {
                let jd = a && a[1];
                let qx = a && a[0];
                let districtId = jd || qx;
                this.condition.DistrictID = districtId;
                this.condition.RoadName = undefined;
                this.condition.CommunityName = undefined;
                this.condition.Intersection = undefined;
                this.setState({
                  roads: [],
                  RoadName: undefined,
                  communities: [],
                  CommunityName: undefined,
                  intersections: [],
                  Intersection: undefined,
                });
                if (districtId) this.getCommunities(districtId);
                if (districtId) this.getRoads(null, qx, jd);
              }}
            />
            &ensp;
            <Select
              allowClear
              value={CommunityName}
              onChange={e => {
                this.condition.CommunityName = e;
                this.condition.RoadName = undefined;
                this.condition.Intersection = undefined;
                this.setState({
                  CommunityName: e,
                  roads: [],
                  RoadName: undefined,
                  intersections: [],
                  Intersection: undefined,
                });
                if (e) this.getRoads(e);
              }}
              placeholder="村社区"
              showSearch
              style={{ width: '130px' }}
            >
              {(communities || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &ensp;
            <Select
              allowClear
              value={RoadName}
              onChange={e => {
                this.condition.RoadName = e;
                this.condition.Intersection = undefined;
                this.setState({ RoadName: e, intersections: [], Intersection: undefined });
                if (e) this.getIntersections(e);
              }}
              onSearch={e => {
                this.condition.RoadName = e;
                this.condition.Intersection = undefined;
                this.setState({ RoadName: e, intersections: [], Intersection: undefined });
              }}
              placeholder="道路名称"
              showSearch
              style={{ width: '120px' }}
            >
              {(roads || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &ensp;
            <Select
              allowClear
              value={Intersection}
              onChange={e => {
                this.condition.Intersection = e;
                this.setState({ Intersection: e });
              }}
              onSearch={e => {
                this.condition.Intersection = e;
                this.setState({ Intersection: e });
              }}
              placeholder="设置路口"
              showSearch
              style={{ width: '120px' }}
            >
              {(intersections || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &ensp;
            <Select
              allowClear
              onChange={e => {
                this.condition.Direction = e;
              }}
              placeholder="设置方位"
              showSearch
              style={{ width: '100px' }}
            >
              {(directions || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &ensp;
            {/* <Select
            allowClear
            onChange={e => {
              this.condition.Material = e;
            }}
            placeholder="材质"
            style={{ width: '150px' }}
          >
            {(Material || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp;
          <Select
            allowClear
            onChange={e => {
              this.condition.Model = e;
            }}
            placeholder="样式"
            style={{ width: '150px' }}
          >
            {(Model || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp;
          <Select
            allowClear
            onChange={e => {
              this.condition.Size = e;
            }}
            placeholder="规格"
            style={{ width: '150px' }}
          >
            {(Size || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp; */}
            <Select
              allowClear
              onChange={e => {
                this.condition.Manufacturers = e;
              }}
              placeholder="生产厂家"
              style={{ width: '200px' }}
            >
              {(manufacturers || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &ensp;
            <DatePicker
              onChange={e => {
                this.condition.start = e ? e.format('YYYY-MM-DD') : null;
              }}
              placeholder="设置时间-起"
              style={{ width: '120px' }}
            />
            &ensp;
            <DatePicker
              onChange={e => {
                this.condition.end = e ? e.format('YYYY-MM-DD') : null;
              }}
              placeholder="设置时间-止"
              style={{ width: '120px' }}
            />
            &ensp;
            <Select
              allowClear
              onChange={e => {
                this.condition.RepairState = (e => {
                  if (e === '待修复') return 0;
                  if (e === '已修复') return 1;
                  if (e === '完好') return 2;
                  return undefined;
                })(e);
              }}
              placeholder="维修状态"
              style={{ width: '100px' }}
            >
              {(['完好', '待修复', '已修复'] || []).map(e => (
                <Select.Option value={e}>{e}</Select.Option>
              ))}
            </Select>
            &ensp;
            <Button
              icon="search"
              type="primary"
              onClick={e => {
                this.onShowSizeChange(1, null);
              }}
            >
              搜索
            </Button>
            &ensp;
            {/* {this.getEditComponent(
            <Button type="primary" icon="file-text" onClick={e => this.onNewLP()}>
              路牌追加
            </Button>
          )} */}
            <Button
              onClick={e => {
                this.condition = {};
                this.setState({ resetCondition: true }, e =>
                  this.setState({ resetCondition: false })
                );
              }}
              type="primary"
              icon="retweet"
            >
              清空
            </Button>
            &ensp;
            {this.getEditComponent(
              <Button
                disabled={!(rows && rows.length)}
                type="primary"
                icon="export"
                onClick={e => this.onExport()}
              >
                路牌导出
              </Button>
            )}
            &ensp;
            {this.getEditComponent(
              <Popover
                placement="right"
                content={
                  <div className={st.qrcode}>
                    <div>
                      <span>1</span>
                      <Button type="primary" onClick={e => this.downloadQRByIds()}>
                        下载已选中
                      </Button>
                    </div>
                    <div>
                      <span>2</span>
                      二维码编号区间：<Input
                        onChange={e => {
                          this.qrStart = e.target.value;
                        }}
                        style={{ width: 80 }}
                        type="number"
                      />&ensp;~&ensp;<Input
                        onChange={e => {
                          this.qrEnd = e.target.value;
                        }}
                        style={{ width: 80 }}
                        type="number"
                      />&ensp;
                      <Button type="primary" onClick={e => this.downloadQRByRange()}>
                        下载
                      </Button>
                    </div>
                  </div>
                }
              >
                <Button type="primary" icon="download">
                  二维码下载
                </Button>
              </Popover>
            )}
          </div>
        )}
        <div className={st.body + ' ct-easyui-table'}>
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
            <GridColumn field="CountyName" title="行政区" align="center" width={120} />
            <GridColumn field="NeighborhoodsName" title="镇街道" align="center" width={120} />
            <GridColumn field="RoadName" title="道路名称" align="center" width={180} />
            <GridColumn field="Intersection" title="设置路口" align="center" width={180} />
            <GridColumn field="Direction" title="设置方位" align="center" width={120} />
            <GridColumn field="BZTime" title="设置时间" align="center" width={120} />
            <GridColumn field="Model" title="样式" align="center" width={140} />
            <GridColumn field="Material" title="材质" align="center" width={160} />
            <GridColumn field="Size" title="规格" align="center" width={140} />
            <GridColumn field="RepairedCount" title="维修次数" align="center" width={140} />
            <GridColumnGroup frozen align="right" width="140px">
              <GridHeaderRow>
                <GridColumn
                  field="operation"
                  title="操作"
                  align="center"
                  render={({ value, row, rowIndex }) => {
                    let i = row;
                    return (
                      <div className={st.rowbtns}>
                        {i.CodeFile ? (
                          <Popover
                            placement="left"
                            content={
                              <div className={st.codefile}>
                                <img
                                  alt="二维码无法显示，请联系管理员"
                                  src={baseUrl + '/' + i.CodeFile.RelativePath}
                                />
                                <a href={baseUrl + '/' + i.CodeFile.RelativePath} download={i.Code}>
                                  下载二维码（{i.Code}）
                                </a>
                              </div>
                            }
                            title={null}
                          >
                            <Icon type="qrcode" title="二维码" />
                          </Popover>
                        ) : null}

                        <Icon
                          type="edit"
                          title={this.edit ? '编辑' : '查看'}
                          onClick={e => this.onEdit(i)}
                        />
                        <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
                        {this.getEditComponent(
                          <Icon type="tool" title="维护" onClick={e => this.onRepair(i)} />
                        )}
                        <Icon type="bars" title="维修记录" onClick={e => this.onRepairList(i)} />
                        {this.getEditComponent(
                          <Popconfirm
                            title="确定注销该路牌？"
                            placement="left"
                            onConfirm={e => this.onCancel(i)}
                          >
                            <Icon type="rollback" title="注销" />
                          </Popconfirm>
                        )}
                      </div>
                    );
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
          {/* <Table
            bordered
            pagination={false}
            columns={this.columns}
            dataSource={rows}
            loading={loading}
            rowSelection={{
              selectedRowKeys: selectedRowKeys,
              onChange: e => {
                this.setState({ selectedRowKeys: e });
              },
            }}
          /> */}
        </div>
        <div className={st.footer}>
          <Pagination
            showSizeChanger
            // 行数发生变化，默认从第一页开始
            onShowSizeChange={(page, size) => this.onShowSizeChange(1, size)}
            current={pageNum}
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
          wrapClassName={st.wrapmodal}
          title={this.formId ? (this.edit ? '路牌编辑' : '路牌查看') : '路牌新增'}
          destroyOnClose={true}
          centered={true}
          visible={showGPForm}
          onCancel={e => this.setState({ showGPForm: false })}
          footer={null}
        >
          <Authorized>
            <GPForm
              id={this.formId}
              onCancelClick={e => this.setState({ showGPForm: false })}
              onSaveSuccess={e => {
                this.onShowSizeChange();
                // this.setState({ showGPForm: false });
              }}
            />
          </Authorized>
        </Modal>
        <Modal
          wrapClassName={st.wrapmodal}
          title="路牌维修"
          destroyOnClose={true}
          centered={true}
          visible={showGPRepair}
          onCancel={e => this.setState({ showGPRepair: false })}
          footer={null}
        >
          <Authorized>
            <GPRepair
              onSaveSuccess={e => this.onShowSizeChange()}
              onCancelClick={e => this.setState({ showGPRepair: false })}
              gpId={this.rpId}
            />
          </Authorized>
        </Modal>
        <Modal
          wrapClassName={st.wrapmodalsmall}
          title="维修列表"
          destroyOnClose={true}
          centered={true}
          visible={showGPRepairList}
          onCancel={e => {
            this.setState({ showGPRepairList: false });
            this.onShowSizeChange();
          }}
          footer={null}
        >
          <Authorized>
            <GPRepairList
              onCancelClick={e => this.setState({ showGPRepairList: false })}
              gpId={this.rpId}
            />
          </Authorized>
        </Modal>
        <Modal
          wrapClassName={st.wrapmodal}
          visible={showLocateMap}
          destroyOnClose={true}
          onCancel={this.closeLocateMap.bind(this)}
          title="定位"
          footer={null}
        >
          <LocateMap
            onMapReady={lm => {
              let center = [this.Lat, this.Lng];
              L.marker(center, { icon: lpIcon }).addTo(lm.map);
              lm.map.setView(center, 18);
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default GPSearch;
