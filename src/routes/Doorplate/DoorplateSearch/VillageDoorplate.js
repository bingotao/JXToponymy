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
import Authorized from '../../../utils/Authorized2';
import VGForm from '../Forms/VGForm.js';
import { GetVGColumns } from '../DoorplateColumns.js';

import st from './VillageDoorplate.less';

import LocateMap from '../../../components/Maps/LocateMap2.js';
import ProveForm from '../../ToponymyProve/ProveForm';
import MPZForm from '../../ToponymyProve/MPZForm';

import {
  url_GetDistrictTreeFromData,
  url_SearchCountryMP,
  url_GetCommunityNamesFromData,
  url_GetViligeNamesFromData,
  url_CancelCountryMP,
  url_GetConditionOfCountryMP,
  url_ExportCountryMP,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { getDistricts } from '../../../utils/utils.js';
import { divIcons } from '../../../components/Maps/icons';

let mpIcon = divIcons.mp;

class VillageDoorplate extends Component {
  constructor(ps) {
    super(ps);
    this.columns = GetVGColumns();

    this.edit = ps.privilege === 'edit';
    this.columns.push({
      title: '操作',
      key: 'operation',
      width: 100,
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title={this.edit ? '编辑' : '查看'} onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            {this.getEditComponent(
              <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
            )}
            {this.getEditComponent(
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
            )}
          </div>
        );
      },
    });
  }

  queryCondition = {
    UseState: 1,
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
    viliges: [],
    viligeCondition: null,
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
    let rt = await Post(url_SearchCountryMP, newCondition);
    this.setState({ loading: false });

    rtHandle(rt, data => {
      // let { pageSize, pageNumber } = this.state;
      this.condition = newCondition;

      this.setState({
        total: data.Count,
        rows: data.Data.map((e, i) => {
          // e.index = (pageNumber - 1) * pageSize + i + 1;
          e.key = e.ID;
          return e;
        }),
      });
    });
  }

  onNewMP() {
    this.VG_ID = null;
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
    this.VG_ID = e.ID;
    this.setState({ showEditForm: true });
  }

  onLocate(e) {
    if (e.Lat && e.Lng) {
      this.VG_Lat = e.Lat;
      this.VG_Lng = e.Lng;
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
    this.VG_ID = e.ID;
    this.setState({ showMPZForm: true });
  }

  onPrint1(e) {
    this.VG_ID = e.ID;
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
    this.queryCondition.ViligeName = null;
    this.setState({
      communities: [],
      communityCondition: null,
      visible: [],
      viligeCondition: null,
    });
    if (e.length) {
      let rt = await Post(url_GetCommunityNamesFromData, {
        type: 1,
        NeighborhoodsID: e[1],
      });
      rtHandle(rt, d => {
        this.setState({
          communities: d,
          viliges: [],
        });
      });
    }
  }

  async getViliges(e) {
    this.queryCondition.ViligeName = null;
    this.setState({ viliges: [], viligeCondition: null });
    if (e) {
      let rt = await Post(url_GetViligeNamesFromData, {
        NeighborhoodsID: this.queryCondition.DistrictID,
        CommunityName: e,
      });
      rtHandle(rt, d => {
        this.setState({ viliges: d });
      });
    }
  }

  async onExport() {
    console.log(this.condition);
    await Post(url_GetConditionOfCountryMP, this.condition, e => {
      window.open(url_ExportCountryMP, '_blank');
    });
  }

  async componentDidMount() {
    let rt = await Post(url_GetDistrictTreeFromData, { type: 3 });

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
      viliges,
      viligeCondition,
      communities,
      communityCondition,
      selectedRows,
    } = this.state;
    const { edit } = this;
    return (
      <div className={st.VillageDoorplate}>
        <div className={st.header}>
          <Cascader
            // changeOnSelect={true}
            options={areas}
            onChange={e => {
              {
                this.getCommunities(e);
                this.queryCondition.DistrictID = e[e.length - 1];
              }
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
              this.getViliges(e);
              this.setState({ communityCondition: e });
            }}
          >
            {communities.map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          <Select
            allowClear
            showSearch
            placeholder="自然村名称"
            value={viligeCondition || undefined}
            style={{ width: '160px' }}
            onSearch={e => {
              this.queryCondition.ViligeName = e;
              this.setState({ viligeCondition: e });
            }}
            onChange={e => {
              this.queryCondition.ViligeName = e;
              this.setState({ viligeCondition: e });
            }}
          >
            {viliges.map(e => <Select.Option value={e}>{e}</Select.Option>)}
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
          wrapClassName={st.vgform}
          visible={showEditForm}
          destroyOnClose={true}
          onCancel={this.closeEditForm.bind(this)}
          title={this.VG_ID ? '门牌维护' : '新增门牌'}
          footer={null}
        >
          <VGForm
            privilege={this.props.privilege}
            id={this.VG_ID}
            onSaveSuccess={e => this.search(this.condition)}
            onCancel={e => this.setState({ showEditForm: false })}
          />
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
              if (this.VG_Lat && this.VG_Lng) {
                let center = [this.VG_Lat, this.VG_Lng];
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
            id={this.VG_ID}
            type="CountryMP"
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
            id={this.VG_ID}
            type="CountryMP"
            onCancel={this.closeMPZForm.bind(this)}
            onOKClick={this.closeMPZForm.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

export default VillageDoorplate;
