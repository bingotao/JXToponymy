/*
*/

import React, { Component } from 'react';
import { Cascader, Input, Button, Table, Pagination, Icon, Modal, Select } from 'antd';
import HDForm from '../Forms/HDForm.js';
import { GetHDColumns } from '../DoorplateColumns.js';
import st from './HouseDoorplate.less';

import { sjlx } from '../../../common/enums.js';
import LocateMap from '../../../components/Maps/LocateMap.js';
import {
  url_GetDistrictTreeFromData,
  url_GetNamesFromData,
  url_SearchResidenceMP,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { getDistricts } from '../../../utils/utils.js';

class HouseDoorplate extends Component {
  constructor(ps) {
    super(ps);
    this.columns = GetHDColumns();
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

  // 动态查询条件
  queryCondition = {
    UseState: 1,
  };

  // 保存点击“查询”后的条件，供导出、翻页使用
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
    residences: [],
    residenceCondition: null,
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

    console.log(newCondition);

    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    let rt = await Post(url_SearchResidenceMP, newCondition);
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
    this.HD_ID = e.ID;
    this.setState({ showEditForm: true });
  }

  onLocate(e) {
    this.HD_Lat = e.Lat;
    this.HD_Lng = e.Lng;
    console.log(this.HD_Lat, this.HD_Lng);
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
    let rt = await Post(url_GetDistrictTreeFromData, { type: 1 });
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
      residences,
      residenceCondition,
      communities,
      communityCondition,
    } = this.state;

    return (
      <div className={st.HouseDoorplate}>
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
          <Cascader
            // changeOnSelect={true}
            options={areas}
            onChange={e => (this.queryCondition.DistrictID = e[e.length - 1])}
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
            value={residenceCondition || '小区名称'}
            style={{ width: '160px' }}
            onSearch={e => {
              this.queryCondition.Residence = e;
              this.setState({ residenceCondition: e });
            }}
            onChange={e => {
              this.queryCondition.Residence = e;
              this.setState({ residenceCondition: e });
            }}
          >
            {residences.map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          <Select
            placeholder="数据类型"
            style={{ width: '100px' }}
            defaultValue={this.queryCondition.UseState}
            onChange={e => (this.queryCondition.UseState = e)}
          >
            {sjlx.map(e => <Select.Option value={e.value}>{e.name}</Select.Option>)}
          </Select>
          <Button type="primary" icon="search" onClick={e => this.onSearchClick()}>
            搜索
          </Button>
          <Button disabled={!(rows && rows.length)} type="default" icon="export" en>
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
          wrapClassName={st.hdform}
          visible={showEditForm}
          destroyOnClose={true}
          onCancel={this.closeEditForm.bind(this)}
          title="门牌编辑"
          footer={null}
        >
          <HDForm id={this.HD_ID} />
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
            x={this.HD_Lng}
            y={this.HD_Lat}
            onSaveLocate={(lat, lng) => {
              console.log(lat, lng);
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default HouseDoorplate;
