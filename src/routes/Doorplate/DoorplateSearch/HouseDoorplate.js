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
import HDForm from '../Forms/HDForm.js';
import Authorized from '../../../utils/Authorized4';
import { GetHDColumns } from '../DoorplateColumns.js';
import st from './HouseDoorplate.less';

import LocateMap from '../../../components/Maps/LocateMap2.js';
import ProveForm from '../../ToponymyProve/ProveForm';
import MPZForm from '../../ToponymyProve/MPZForm';
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
import { DZZMPrint, MPZPrint } from '../../../services/MP';

let mpIcon = divIcons.mp;

class HouseDoorplate extends Component {
  constructor(ps) {
    super(ps);

    this.columns = GetHDColumns();
    this.edit = ps.edit;
    this.columns.push({
      title: '操作',
      key: 'operation',
      width: 140,
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

  // 动态查询条件
  queryCondition = {
    UseState: 1,
  };

  // 保存点击“查询”后的条件，供导出、翻页使用
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
    residences: [],
    residenceCondition: null,
    communities: [],
    communityCondition: null,
    selectedRows: [],
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
        selectedRows: [],
        total: data.Count,
        rows: data.Data.map((e, i) => {
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
    if (e.Lat && e.Lng) {
      this.HD_Lat = e.Lat;
      this.HD_Lng = e.Lng;
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

  onPrintMPZ(ids) {
    if (ids && ids.length) {
      MPZPrint({
        ids: ids,
        mptype: '住宅门牌',
        CertificateType: '门牌证',
      });
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

  onPrint1(e) {
    this.HD_ID = e.ID;
    this.setState({ showProveForm: true });
  }

  closeMPZForm() {
    this.setState({ showMPZForm: false });
  }

  closeProveForm() {
    this.setState({ showProveForm: false });
  }

  async getCommunities(e) {
    // 获取社区时清空原有条件
    this.queryCondition.CommunityName = null;
    this.queryCondition.ResidenceName = null;
    this.setState({
      communities: [],
      communityCondition: null,
      residences: [],
      residenceCondition: null,
    });
    if (e.length) {
      let rt = await Post(url_GetCommunityNamesFromData, {
        type: 1,
        NeighborhoodsID: e[1],
      });
      rtHandle(rt, d => {
        this.setState({
          communities: d,
          residences: [],
        });
      });
    }
  }

  async getResidences(e) {
    this.queryCondition.ResidenceName = null;
    this.setState({ residences: [], residenceCondition: null });
    if (e) {
      let rt = await Post(url_GetResidenceNamesFromData, {
        NeighborhoodsID: this.queryCondition.DistrictID,
        CommunityName: e,
      });
      rtHandle(rt, d => {
        this.setState({ residences: d });
      });
    }
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

    let w = $(this.body).width(),
      h = $(this.body).height();
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
      residences,
      residenceCondition,
      communities,
      communityCondition,
      selectedRows,
    } = this.state;

    let { edit } = this.props;

    return (
      <div className={st.HouseDoorplate}>
        <div className={st.header}>
          <Cascader
            // changeOnSelect={true}
            options={areas}
            onChange={e => {
              this.queryCondition.DistrictID = e[e.length - 1];
              this.getCommunities(e);
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
              this.getResidences(e);
              this.setState({ communityCondition: e });
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
            placeholder="标准地址"
            style={{ width: '160px' }}
            onChange={e => (this.queryCondition.StandardAddress = e.target.value)}
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
          {edit ? (
            <Button type="primary" icon="file-text" onClick={e => this.onNewMP()}>
              新增门牌
            </Button>
          ) : null}
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
        </div>
        <div ref={e => (this.body = e)} className={st.body}>
          <Table
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
          <ProveForm
            id={this.HD_ID}
            type="ResidenceMP"
            onCancel={this.closeProveForm.bind(this)}
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
            id={this.HD_ID}
            type="ResidenceMP"
            onCancel={this.closeMPZForm.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

export default HouseDoorplate;
