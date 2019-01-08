import React, { Component } from 'react';
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
} from 'antd';
import Authorized from '../../../utils/Authorized4';
import RDForm from '../Forms/RDForm.js';
import { GetRDColumns } from '../DoorplateColumns.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import st from './RoadDoorplate.less';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { sjlx, mpdsh } from '../../../common/enums.js';
import { getDistricts } from '../../../utils/utils.js';

import ProveForm from '../../ToponymyProve/ProveForm';
import MPZForm from '../../ToponymyProve/MPZForm';
import {
  url_GetDistrictTreeFromData,
  url_GetCommunityNamesFromData,
  url_GetRoadNamesFromData,
  url_SearchRoadMP,
  url_CancelRoadMP,
  url_GetConditionOfRoadMP,
  url_ExportRoadMP,
} from '../../../common/urls.js';
import { divIcons } from '../../../components/Maps/icons';

let mpIcon = divIcons.mp;

class RoadDoorplate extends Component {
  constructor(ps) {
    super(ps);
    this.columns = GetRDColumns();
    this.edit = ps.edit;
    this.columns.push({
      title: '操作',
      key: 'operation',
      width: 100,
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title={this.edit ? '编辑' : '查看'} onClick={e => this.onEdit(i)} />
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
      },
    });
  }

  queryCondition = {
    DistrictID: null,
    RoadName: '',
    UseState: 1,
    MPNumberType: 0,
  };

  condition = {};

  state = {
    showMPZForm: false,
    showProveForm: false,
    showLocateMap: false,
    showEditForm: false,
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

  async search(condition) {
    let { pageSize, pageNumber } = this.state;
    let newCondition = {
      ...condition,
      PageSize: pageSize,
      pageNum: pageNumber,
    };

    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    let rt = await Post(url_SearchRoadMP, newCondition);
    this.setState({ loading: false });

    rtHandle(rt, data => {
      this.condition = newCondition;
      this.setState({
        total: data.Count,
        rows: data.Data.map((e, i) => {
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
      e => this.search(this.condition)
    );
  }

  closeEditForm() {
    this.setState({ showEditForm: false });
  }

  onEdit(e) {
    this.RD_ID = e.ID;
    this.setState({ showEditForm: true });
  }

  onLocate(e) {
    if (e.Lat && e.Lng) {
      this.RD_Lat = e.Lat;
      this.RD_Lng = e.Lng;
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
      });
    } else {
      notification.warn({ description: '请选择需要注销的门牌！', message: '警告' });
    }
  }

  onPrint0(e) {
    this.RD_ID = e.ID;
    this.setState({ showMPZForm: true });
  }

  onPrint1(e) {
    this.RD_ID = e.ID;
    this.setState({ showProveForm: true });
  }

  closeMPZForm() {
    this.setState({ showMPZForm: false });
  }

  closeProveForm() {
    this.setState({ showProveForm: false });
  }

  async getCommunities(e) {
    this.queryCondition.CommunityName = null;
    this.setState({
      communities: [],
      communityCondition: null,
    });
    if (e.length) {
      let rt = await Post(url_GetCommunityNamesFromData, {
        type: 2,
        NeighborhoodsID: e[1],
      });
      rtHandle(rt, d => {
        this.setState({
          communities: d,
        });
      });
    }
  }

  async getRoads(e) {
    this.queryCondition.RoadName = null;
    this.setState({
      roads: [],
      roadCondition: null,
    });
    if (e.length) {
      let rt = await Post(url_GetRoadNamesFromData, {
        type: 2,
        NeighborhoodsID: e[1],
      });
      rtHandle(rt, d => {
        this.setState({
          roads: d,
        });
      });
    }
  }

  async onExport() {
    console.log(this.condition);
    await Post(url_GetConditionOfRoadMP, this.condition, e => {
      window.open(url_ExportRoadMP, '_blank');
    });
  }

  async componentDidMount() {
    let rt = await Post(url_GetDistrictTreeFromData, { type: 2 });

    rtHandle(rt, d => {
      let areas = getDistricts(d);
      this.setState({ areas: areas });
    });
  }

  render() {
    let {
      total,
      showMPZForm,
      showProveForm,
      showEditForm,
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
      <div className={st.RoadDoorplate}>
        <div className={st.header}>
          <Cascader
            // changeOnSelect={true}
            options={areas}
            onChange={e => {
              this.getRoads(e);
              this.getCommunities(e);
              this.queryCondition.DistrictID = e[e.length - 1];
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
            style={{ width: '160px' }}
            onSearch={e => {
              this.queryCondition.CommunityName = e;
              this.setState({ communityCondition: e });
            }}
            onChange={e => {
              this.queryCondition.CommunityName = e;
              this.setState({ communityCondition: e });
            }}
          >
            {communities.map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          <Select
            allowClear
            showSearch
            placeholder="道路名称"
            value={roadCondition || undefined}
            style={{ width: '160px' }}
            onSearch={e => {
              this.queryCondition.RoadName = e;
              this.setState({ roadCondition: e });
            }}
            onChange={e => {
              this.queryCondition.RoadName = e;
              this.setState({ roadCondition: e });
            }}
          >
            {roads.map(e => <Select.Option value={e}>{e}</Select.Option>)}
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
            placeholder="标准地址"
            style={{ width: '160px' }}
            onChange={e => (this.queryCondition.StandardAddress = e.target.value)}
          />
          <Select
            placeholder="单双号"
            style={{ width: '100px' }}
            defaultValue={0}
            onChange={e => (this.queryCondition.MPNumberType = e)}
          >
            {[{ id: 0, name: '全部', value: 0 }]
              .concat(mpdsh)
              .map(e => <Select.Option value={e.value}>{e.name}</Select.Option>)}
          </Select>
          {/* <Select
            defaultValue={this.queryCondition.UseState}
            placeholder="数据类型"
            style={{ width: '100px' }}
            onChange={e => (this.queryCondition.UseState = e)}
          >
            {sjlx.map(e => <Select.Option value={e.value}>{e.name}</Select.Option>)}
          </Select> */}
          <Button type="primary" icon="search" onClick={e => this.onSearchClick()}>
            搜索
          </Button>
          {this.getEditComponent(
            <Button type="primary" icon="file-text" onClick={e => this.onNewMP()}>
              新增门牌
            </Button>
          )}
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
          {/* <Button
            disabled={!(selectedRows && selectedRows.length)}
            type="primary"
            icon="environment-o"
          >
            定位
          </Button> */}
          {this.getEditComponent(
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
          )}
          {this.getEditComponent(
            <Button disabled={!(selectedRows && selectedRows.length)} type="primary" icon="printer">
              打印门牌证
            </Button>
          )}
        </div>
        <div className={st.body}>
          <Table
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
          />
        </div>
        <div className={st.footer}>
          <Pagination
            showSizeChanger
            // 行数发生变化，默认从第一页开始
            onShowSizeChange={(page, size) => this.onShowSizeChange(1, size)}
            current={pageNumber}
            pageSize={pageSize}
            total={total}
            pageSizeOptions={[15, 50, 100, 200]}
            onChange={this.onShowSizeChange.bind(this)}
            showTotal={(total, range) =>
              total ? `共：${total} 条，当前：${range[0]}-${range[1]} 条` : ''
            }
          />
        </div>
        <Modal
          wrapClassName={st.rdform}
          visible={showEditForm}
          destroyOnClose={true}
          onCancel={this.closeEditForm.bind(this)}
          title={this.RD_ID ? '门牌维护' : '新增门牌'}
          footer={null}
        >
          <Authorized>
            <RDForm
              id={this.RD_ID}
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
          <ProveForm
            id={this.RD_ID}
            type="RoadMP"
            onCancel={this.closeProveForm.bind(this)}
            onOKClick={this.closeProveForm.bind(this)}
          />
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
          <MPZForm
            id={this.RD_ID}
            type="RoadMP"
            onCancel={this.closeMPZForm.bind(this)}
            onOKClick={this.closeMPZForm.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

export default RoadDoorplate;
