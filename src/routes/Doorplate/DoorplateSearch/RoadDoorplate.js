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
  Radio,
} from 'antd';
import RDForm from '../Forms/RDForm.js';
import { GetRDColumns } from '../DoorplateColumns.js';
import LocateMap from '../../../components/Maps/LocateMap.js';
import st from './RoadDoorplate.less';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { sjlx, mpdsh } from '../../../common/enums.js';
import { getDistricts } from '../../../utils/utils.js';
import {
  url_GetDistrictTreeFromData,
  url_GetCommunityNamesFromData,
  url_GetRoadNamesFromData,
  url_SearchRoadMP,
  url_CancelRoadMP,
} from '../../../common/urls.js';

class RoadDoorplate extends Component {
  constructor(ps) {
    super(ps);
    this.columns = GetRDColumns();
    this.columns.push({
      title: '操作',
      key: 'operation',
      width: 140,
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
            <Icon type="printer" title="打印地名证明" onClick={e => this.onPrint0(i)} />
            <Icon type="idcard" title="打印门牌证" onClick={e => this.onPrint1(i)} />
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
    let rt = await Post(url_SearchRoadMP, newCondition);
    this.setState({ loading: false });

    rtHandle(rt, data => {
      let { pageSize, pageNumber } = this.state;
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
    this.RD_Lat = e.Lat;
    this.RD_Lng = e.Lng;
    console.log(this.RD_Lat, this.RD_Lng);
    this.setState({ showLocateMap: true });
  }

  closeLocateMap() {
    this.setState({ showLocateMap: false });
  }

  onCancel(e) {
    console.log(e);
    Modal.confirm({
      title: '提醒',
      content: '确定注销？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await Post(url_CancelRoadMP, { ID: [e.ID] }, e => {
          notification.success({ description: '注销成功！', message: '成功' });
          this.search(this.condition);
        });
      },
      onCancel() {},
    });
  }

  onPrint0(e) {
    console.log(e);
  }

  onPrint1(e) {
    console.log(e);
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
    } = this.state;

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
            style={{ width: '200px' }}
            expandTrigger="hover"
          />
          <Select
            allowClear
            showSearch
            value={communityCondition || '村社区'}
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
            value={roadCondition || '道路名称'}
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
            onChange={e => (this.queryCondition.MPNumberType = e)}
          >
            {[{ id: 0, name: '全部', value: 0 }]
              .concat(mpdsh)
              .map(e => <Select.Option value={e.value}>{e.name}</Select.Option>)}
          </Select>
          <Select
            defaultValue={this.queryCondition.UseState}
            placeholder="数据类型"
            style={{ width: '100px' }}
            onChange={e => (this.queryCondition.UseState = e)}
          >
            {sjlx.map(e => <Select.Option value={e.value}>{e.name}</Select.Option>)}
          </Select>

          <Button type="primary" icon="search" onClick={e => this.onSearchClick()}>
            搜索
          </Button>
          <Button disabled={!total} type="default" icon="export" en>
            导出
          </Button>
        </div>
        <div className={st.body}>
          <Table
            bordered={true}
            pagination={false}
            columns={this.columns}
            dataSource={rows}
            loading={loading}
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
          title="门牌编辑"
          footer={null}
        >
          <RDForm id={this.RD_ID} onSaveSuccess={e => this.search(this.condition)} />
        </Modal>
        <Modal
          wrapClassName={st.locatemap}
          visible={showLocateMap}
          destroyOnClose={true}
          onCancel={this.closeLocateMap.bind(this)}
          title="定位"
          footer={null}
        >
          <LocateMap x={this.RD_Lng} y={this.RD_Lat} />
        </Modal>
      </div>
    );
  }
}

export default RoadDoorplate;
