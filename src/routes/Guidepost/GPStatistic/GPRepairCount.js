import { Component } from 'react';
import {
  Input,
  Icon,
  Button,
  Table,
  Cascader,
  DatePicker,
  Select,
  Pagination,
  notification,
  Modal,
  Spin,
} from 'antd';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';
import st from './GPRepairCount.less';
import { whfs, bxfs } from '../../../common/enums.js';
import {
  baseUrl,
  url_GetRPBZDataFromData,
  url_GetDistrictTreeFromDistrict,
  url_GetNamesFromDic,
} from '../../../common/urls.js';

import { getDistricts } from '../../../utils/utils.js';
import { Post } from '../../../utils/request';
import { getCommunityNamesFromData } from '../../../services/Common';
import { getRPRepairTJ, ExportRPRepairTJ } from '../../../services/RPStatistic';
import GPForm from '../Forms/GPForm';
import LocateMap from '../../../components/Maps/LocateMap2';
import GPRepair from '../Forms/GPRepair';
import GPRepairList from '../Forms/GPRepairList';
import { divIcons } from '../../../components/Maps/icons';
import Authorized from '../../../utils/Authorized4';

let lpIcon = divIcons.lp;

class GPRepairCount extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  state = {
    clearCondition: false,
    showRepairList: false,
    showLocate: false,
    showRepair: false,
    showRPForm: false,
    loading: false,
    rows: [],
    total: 0,
    pageSize: 25,
    pageNum: 1,
    districts: [],
    communities: [],
    RepairFactory: [],
    // RepairParts: [],
    CommunityName: undefined,
    isFinishRepair: 1,
  };

  condition = { isFinishRepair: 1 };

  columns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '行政区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    {
      title: '镇街道',
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
      key: 'operation',
      width: 120,
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onShowRPForm(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onShowLocate(i)} />
            <Icon type="exception" title="维护列表" onClick={e => this.onShowRepairList(i)} />
            {this.edit ? (
              <Icon type="tool" title="维修" onClick={e => this.onShowRepair(i)} />
            ) : null}
          </div>
        );
      },
    },
  ];

  onShowRepairList(i) {
    this.gpId = i.ID;
    this.setState({ showRepairList: true });
  }

  closeRepairList() {
    this.setState({ showRepairList: false });
  }

  onShowLocate(i) {
    if (i.PositionX && i.PositionY) {
      this.PositionX = i.PositionX;
      this.PositionY = i.PositionY;
      this.setState({ showLocate: true });
    } else {
      notification.warn({ description: '该门牌尚未定位，请先进行定位！', message: '警告' });
    }
  }

  closeLocate() {
    this.setState({ showLocate: false });
  }

  onShowRepair(i) {
    this.gpId = i.ID;
    this.setState({ showRepair: true });
  }

  closeRepair() {
    this.setState({ showRepair: false });
  }

  onShowRPForm(i) {
    this.gpId = i.ID;
    this.setState({ showRPForm: true });
  }

  closeRPForm() {
    this.setState({ showRPForm: false });
  }

  async getCommunities(e) {
    await getCommunityNamesFromData({ type: 5, DistrictID: e }, e => {
      this.setState({ communities: e });
    });
  }

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  onShowSizeChange(pn, ps) {
    let page = {};
    if (pn) page.pageNum = pn;
    if (ps) page.pageSize = ps;
    this.setState(page, e => this.search(this.condition));
  }

  async search() {
    let { pageSize, pageNum } = this.state;
    let newCondition = {
      ...this.condition,
      pageSize,
      pageNum,
    };
    // 未修复情况下不查询时间
    if (newCondition.isFinishRepair == 0) {
      delete newCondition.FinishTimeEnd;
      delete newCondition.FinishTimeStart;
    }
    console.log(newCondition);
    this.setState({ loading: true });
    await getRPRepairTJ(newCondition, e => {
      this.condition = newCondition;
      let { Count, Data } = e;
      let { pageSize, pageNum } = this.state;
      this.setState({
        total: Count,
        rows: Data.map((item, idx) => {
          item.index = (pageNum - 1) * pageSize + idx + 1;
          return item;
        }),
      });
    });
    this.setState({ loading: false });
  }

  export() {
    let { rows } = this.state;
    if (rows && rows.length) {
      ExportRPRepairTJ(this.condition);
    }
  }

  async getInitData() {
    await Post(url_GetRPBZDataFromData, null, d => {
      this.setState({ ...d });
    });
  }

  componentDidMount() {
    this.getDistricts();
    this.getInitData();
    this.search();
  }

  render() {
    let {
      clearCondition,
      showRepairList,
      showLocate,
      showRepair,
      showRPForm,
      loading,
      rows,
      pageSize,
      total,
      pageNum,
      districts,
      communities,
      // RepairParts,
      RepairFactory,
      CommunityName,
      isFinishRepair,
    } = this.state;
    return (
      <div className={st.GPRepairCount}>
        {clearCondition ? null : (
          <div className={st.condition}>
            <Cascader
              allowClear
              expandTrigger="hover"
              options={districts}
              placeholder="行政区"
              style={{ width: '200px' }}
              changeOnSelect
              onChange={(a, b) => {
                let v = a && a.length ? a[a.length - 1] : null;
                this.condition.DistrictID = v;
                this.condition.CommunityName = null;
                this.setState({ CommunityName: undefined, communities: [] });
                if (v) {
                  this.getCommunities(v);
                }
              }}
            />
            &emsp;
            <Select
              allowClear
              onChange={e => {
                this.condition.CommunityName = e;
                this.setState({ CommunityName: e });
              }}
              placeholder="村社区"
              showSearch
              style={{ width: '150px' }}
              value={CommunityName || undefined}
            >
              {(communities || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &emsp;
            <Select
              onChange={e => {
                this.condition.RepairMode = e;
              }}
              placeholder="维护方式"
              allowClear
              style={{ width: '150px' }}
            >
              {(whfs || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &emsp;
            <Select
              allowClear
              onChange={e => {
                this.condition.BXFS = e;
              }}
              placeholder="报修方式"
              style={{ width: '150px' }}
            >
              {bxfs.map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &emsp;
            <Input
              type="number"
              placeholder="维修次数"
              style={{ width: '100px' }}
              onChange={e => {
                this.condition.RepairedCount = e.target.value ? parseInt(e.target.value) : null;
              }}
            />
            {/* <Select
              allowClear
              onChange={e => {
                this.condition.RepairParts = e;
              }}
              placeholder="维修部位"
              style={{ width: '150px' }}
            >
              {(RepairParts || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &emsp;
            <Input
              placeholder="维修内容"
              style={{ width: '150px' }}
              onChange={e => {
                this.condition.RepairContent = e.target.value;
              }}
            /> */}
            &emsp;
            <Select
              allowClear
              onChange={e => {
                this.condition.RepairFactory = e;
              }}
              placeholder="维修厂家"
              style={{ width: '200px' }}
            >
              {(RepairFactory || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
            </Select>
            &emsp;
            <Select
              defaultValue={isFinishRepair}
              onChange={e => {
                this.condition.isFinishRepair = e;
                this.setState({ isFinishRepair: e });
              }}
              placeholder="修复情况"
              style={{ width: '100px' }}
              value={isFinishRepair}
            >
              <Select.Option value={0}>未修复</Select.Option>
              <Select.Option value={1}>已修复</Select.Option>
            </Select>
            &emsp;
            <DatePicker
              disabled={isFinishRepair == 0}
              onChange={e => {
                this.condition.FinishTimeStart = e && e.format('YYYY-MM-DD');
              }}
              placeholder="修复时间（起）"
              style={{ width: '150px' }}
            />
            &ensp;~ &ensp;
            <DatePicker
              disabled={isFinishRepair == 0}
              onChange={e => {
                this.condition.FinishTimeEnd = e && e.format('YYYY-MM-DD');
              }}
              placeholder="修复时间（止）"
              style={{ width: '150px' }}
            />
            &emsp;
            <div>
              <Button
                type="primary"
                icon="pie-chart"
                onClick={e => {
                  this.onShowSizeChange(1, null);
                }}
              >
                查询
              </Button>
              &emsp;
              <Button
                type="primary"
                icon="retweet"
                onClick={e => {
                  this.condition = {
                    isFinishRepair: 1,
                  };
                  this.setState(
                    {
                      CommunityName: undefined,
                      communities: [],
                      clearCondition: true,
                      isFinishRepair: 1,
                    },
                    e => {
                      this.setState({ clearCondition: false });
                    }
                  );
                }}
              >
                条件清空
              </Button>
              &emsp;
              <Button
                type="primary"
                icon="export"
                disabled={!(rows && rows.length)}
                onClick={e => {
                  this.export();
                }}
              >
                导出
              </Button>
            </div>
          </div>
        )}
        <div className={st.result + ' ct-easyui-table'}>
          {loading ? (
            <div className={st.loading}>
              <Spin {...loading} />
            </div>
          ) : null}
          <DataGrid data={rows} style={{ height: '100%' }}>
            <GridColumn field="index" title="序号" align="center" width="100px" />
            <GridColumn field="CountyName" title="行政区" align="center" />
            <GridColumn field="NeighborhoodsName" title="镇街道" align="center" />
            <GridColumn field="RoadName" title="道路名称" align="center" />
            <GridColumn field="Intersection" title="设置路口" align="center" />
            <GridColumn field="Direction" title="设置方位" align="center" />
            <GridColumn field="BZTime" title="设置时间" align="center" />
            <GridColumn field="RepairedCount" title="维修次数" align="center" />
            <GridColumn field="FinishRepaireTime" title="修复时间" align="center" />
            <GridColumn
              width="140px"
              field="operation"
              title="操作"
              align="center"
              render={({ value, row, rowIndex }) => {
                let i = row;
                return (
                  <div className={st.rowbtns}>
                    <Icon type="edit" title="编辑" onClick={e => this.onShowRPForm(i)} />
                    <Icon type="environment-o" title="定位" onClick={e => this.onShowLocate(i)} />
                    {this.edit ? (
                      <Icon type="tool" title="维修" onClick={e => this.onShowRepair(i)} />
                    ) : null}
                    <Icon type="bars" title="维修记录" onClick={e => this.onShowRepairList(i)} />
                  </div>
                );
              }}
            />
          </DataGrid>
          {/* <Table
            loading={loading}
            pagination={false}
            bordered
            columns={this.columns}
            dataSource={rows}
          /> */}
        </div>
        <div className={st.footer}>
          <Pagination
            showSizeChanger
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
          wrapClassName={'fullmodal'}
          title={'路牌编辑'}
          destroyOnClose={true}
          centered={true}
          visible={showRPForm}
          onCancel={e => this.setState({ showRPForm: false })}
          footer={null}
        >
          <Authorized>
            <GPForm
              id={this.gpId}
              onCancelClick={e => this.setState({ showRPForm: false })}
              onSaveSuccess={e => {
                this.onShowSizeChange();
              }}
              operateType={'路牌编辑'}
            />
          </Authorized>
        </Modal>
        <Modal
          wrapClassName={'fullmodal'}
          title="路牌维修"
          destroyOnClose={true}
          centered={true}
          visible={showRepair}
          onCancel={e => this.setState({ showRepair: false })}
          footer={null}
        >
          <Authorized>
            <GPRepair
              onSaveSuccess={e => this.onShowSizeChange()}
              onCancelClick={e => this.setState({ showRepair: false })}
              gpId={this.gpId}
            />
          </Authorized>
        </Modal>
        <Modal
          wrapClassName={'smallmodal'}
          title="维修列表"
          destroyOnClose={true}
          centered={true}
          visible={showRepairList}
          onCancel={e => {
            this.setState({ showRepairList: false });
            this.onShowSizeChange();
          }}
          footer={null}
        >
          <Authorized>
            <GPRepairList
              onCancelClick={e => this.setState({ showRepairList: false })}
              gpId={this.gpId}
            />
          </Authorized>
        </Modal>
        <Modal
          wrapClassName={'fullmodal'}
          visible={showLocate}
          destroyOnClose={true}
          onCancel={this.closeLocate.bind(this)}
          title="定位"
          footer={null}
        >
          <LocateMap
            onMapReady={lm => {
              let center = [this.PositionY, this.PositionX];
              L.marker(center, { icon: lpIcon }).addTo(lm.map);
              lm.map.setView(center, 18);
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default GPRepairCount;
