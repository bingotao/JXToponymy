import React, { Component } from 'react';
import {
  notification,
  Select,
  Input,
  Cascader,
  Button,
  DatePicker,
  Table,
  Pagination,
  Icon,
  Modal,
  Popconfirm,
  Popover,
} from 'antd';
import st from './GPSearch.less';

import GPForm from '../Forms/GPForm.js';
import GPRepair from '../Forms/GPRepair.js';
import GPRepairList from '../Forms/GPRepairList.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';

import {
  baseUrl,
  url_GetDistrictTreeFromDistrict,
  url_GetDirectionFromDic,
  url_GetRPBZDataFromData,
  url_SearchRP,
  url_SearchRPByID,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { getRoadNamesFromData } from '../../../services/Common';
import { getDistricts } from '../../../utils/utils.js';
import { divIcons } from '../../../components/Maps/icons';
import { cancelRP, upRPDownloadCondition, upQRDownloadCondition } from '../../../services/RP';

let lpIcon = divIcons.lp;

class GPSearch extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.privilege === 'edit';
  }

  state = {
    showGPForm: false,
    showGPRepair: false,
    showLocateMap: false,
    selectedRowKeys: [],
    areas: [],
    total: 0,
    rows: [],
    pageSize: 25,
    pageNum: 1,
    loading: false,
    Direction: [],
    Intersection: [],
    Manufacturers: [],
    Material: [],
    Model: [],
    Size: [],
    districts: [],
    roads: [],
  };

  condition = {};

  columns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '二维码编号', align: 'center', dataIndex: 'Code', key: 'Code' },
    { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    {
      title: '镇（街道）',
      align: 'center',
      dataIndex: 'NeighborhoodsName',
      key: 'NeighborhoodsName',
    },
    { title: '道路名称', align: 'center', dataIndex: 'RoadName', key: 'RoadName' },
    { title: '设置路口', align: 'center', dataIndex: 'Intersection', key: 'Intersection' },
    { title: '设置方向', align: 'center', dataIndex: 'Direction', key: 'Direction' },
    { title: '设置时间', align: 'center', dataIndex: 'BZTime', key: 'BZTime' },
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
                    <a href={baseUrl + '/'+ i.CodeFile.RelativePath} download={i.Code}>
                      下载二维码（{i.Code}）
                    </a>
                  </div>
                }
                title={null}
              >
                <Icon type="qrcode" title="二维码" />
              </Popover>
            ) : null}

            <Icon type="edit" title="查看" onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            {this.getEditComponent(
              <Icon type="tool" title="维护" onClick={e => this.onRepair(i)} />
            )}
            <Icon type="bars" title="维修记录" onClick={e => this.onRepairList(i)} />
            {this.getEditComponent(
              <Popconfirm
                title="确定注销该门牌？"
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
      notification.warn({ description: '该门牌无位置信息！', message: '警告' });
    }
  }

  onRepair(i) {
    this.rpId = i.ID;
    this.setState({ showGPRepair: true });
  }

  async onCancel(i) {
    await cancelRP({ IDs: [i.ID] }, e => {
      notification.success({ description: '门牌已注销！', message: '成功' });
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
      notification.warn({ description: '请设置起始门牌二维码起始编号！', message: '警告' });
    }
  }

  async downloadQRByIds() {
    let { selectedRowKeys } = this.state;
    if (!selectedRowKeys || !selectedRowKeys.length) {
      notification.warn({ description: '尚未选择任何门牌！', message: '警告' });
      return;
    } else {
      await upQRDownloadCondition({ rpids: selectedRowKeys }, e => {
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

    console.log(newCondition);

    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    let rt = await Post(url_SearchRP, newCondition, data => {
      this.condition = newCondition;
      this.setState({
        selectedRowKeys: [],
        total: data.Count,
        rows: data.Data.map((e, i) => {
          e.key = e.ID;
          e.index = pageSize * (pageNum - 1) + i + 1;
          return e;
        }),
      });
    });
    this.setState({ loading: false });
  }

  async getRoads(jd) {
    await getRoadNamesFromData({ type: 5, NeighborhoodsID: jd }, d => {
      this.setState({ roads: d });
    });
  }

  async getInitData() {
    await Post(url_GetRPBZDataFromData, null, e => {
      this.setState(e);
    });
  }

  componentDidMount() {
    this.getDistricts();
    this.getInitData();
  }

  render() {
    let {
      showGPForm,
      showGPRepair,
      showLocateMap,
      showGPRepairList,
      selectedRowKeys,
      rows,
      total,
      pageSize,
      pageNum,
      loading,
      Direction,
      Intersection,
      Manufacturers,
      Material,
      Model,
      Size,
      districts,
      roads,
    } = this.state;

    return (
      <div className={st.GPSearch}>
        <div className={st.header}>
          <Cascader
            allowClear
            expandTrigger="hover"
            options={districts}
            placeholder="行政区"
            onChange={(a, b) => {
              let jd = a && a[1];
              this.condition.DistrictID = jd;
              this.getRoads(jd);
            }}
          />
          &ensp;
          <Select
            allowClear
            onChange={e => {
              this.condition.RoadName = e;
            }}
            placeholder="道路名称"
            showSearch
            style={{ width: '150px' }}
          >
            {(roads || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp;
          <Select
            allowClear
            onChange={e => {
              this.condition.Intersection = e;
            }}
            placeholder="设置路口"
            showSearch
            style={{ width: '150px' }}
          >
            {(Intersection || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
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
            {(Direction || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp;
          <Select
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
          &ensp;
          <Select
            allowClear
            onChange={e => {
              this.condition.Manufacturers = e;
            }}
            placeholder="生产厂家"
            style={{ width: '200px' }}
          >
            {(Manufacturers || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp;
          <DatePicker
            onChange={e => {
              this.condition.start = e ? e.format('YYYY-MM-DD') : null;
            }}
            placeholder="设置时间（起）"
            style={{ width: '150px' }}
          />
          &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e ? e.format('YYYY-MM-DD') : null;
            }}
            placeholder="设置时间（止）"
            style={{ width: '150px' }}
          />
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
          {this.getEditComponent(
            <Button type="primary" icon="file-text" onClick={e => this.onNewLP()}>
              路牌追加
            </Button>
          )}{' '}
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
          &ensp; &ensp;
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
        <div className={st.body}>
          <Table
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
          />
        </div>
        <div className={st.footer}>
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
        <Modal
          wrapClassName={st.wrapmodal}
          title={this.formId ? '路牌编辑' : '路牌新增'}
          destroyOnClose={true}
          centered={true}
          visible={showGPForm}
          onCancel={e => this.setState({ showGPForm: false })}
          footer={null}
        >
          <GPForm
            privilege={this.props.privilege}
            id={this.formId}
            onCancelClick={e => this.setState({ showGPForm: false })}
            onSaveSuccess={e => {
              this.onShowSizeChange();
              // this.setState({ showGPForm: false });
            }}
          />
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
          <GPRepair
            privilege={this.props.privilege}
            onSaveSuccess={e => this.onShowSizeChange()}
            onCancelClick={e => this.setState({ showGPRepair: false })}
            gpId={this.rpId}
          />
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
          <GPRepairList
            privilege={this.props.privilege}
            onCancelClick={e => this.setState({ showGPRepairList: false })}
            gpId={this.rpId}
          />
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
