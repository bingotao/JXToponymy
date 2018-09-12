import React, { Component } from 'react';
import { Cascader, Input, Button, Table, Pagination, Icon, Modal, Select, Radio } from 'antd';
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
  url_GetNamesFromData,
  url_SearchRoadMP,
} from '../../../common/urls.js';

class RoadDoorplate extends Component {
  constructor(ps) {
    super(ps);
    this.columns = GetRDColumns();
    this.columns.push({
      title: '操作',
      key: 'operation',
      width: 160,
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
            <Icon type="printer" title="打印地名证明" onClick={e => this.onPrint0(i)} />
            <Icon type="idcard" title="打印门牌证" onClick={e => this.onPrint1(i)} />
            <Icon type="delete" title="删除" onClick={e => this.onDelete(i)} />
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
          e.index = (pageNumber - 1) * pageSize + i + 1;
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
  }

  onPrint0(e) {
    console.log(e);
  }

  onPrint1(e) {
    console.log(e);
  }

  onDelete(e) {
    console.log(e);
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
          <Select
            placeholder="单双号"
            style={{ width: '100px' }}
            onChange={e => (this.queryCondition.MPNumberType = e)}
          >
            {[{ id: 0, name: '全部', value: 0 }]
              .concat(mpdsh)
              .map(e => <Select.Option value={e.value}>{e.name}</Select.Option>)}
          </Select>
          <Cascader
            changeOnSelect={true}
            options={areas}
            onChange={e => (this.queryCondition.DistrictID = e[e.length - 1])}
            placeholder="请选择行政区"
            style={{ width: '300px' }}
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
          <RDForm id={this.RD_ID} />
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
            x={this.RD_Lng}
            y={this.RD_Lat}
            onSaveLocate={(lat, lng) => {
              console.log(lat, lng);
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default RoadDoorplate;
