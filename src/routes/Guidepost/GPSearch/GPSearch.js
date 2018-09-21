import React, { Component } from 'react';
import { Select, Input, Cascader, Button, DatePicker, Table, Pagination, Icon, Modal } from 'antd';
import st from './GPSearch.less';

import GPForm from '../Forms/GPForm.js';
import GPRepair from '../Forms/GPRepair.js';

import {
  url_GetDirectionFromDic,
  url_GetRPBZDataFromData,
  url_SearchRP,
  url_SearchRPByID,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';

class GPSearch extends Component {
  state = {
    showGPForm: false,
    showGPRepair: false,
    showLocateMap: false,
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
  };

  condition = {};

  columns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
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
    { title: '维修次数', align: 'center', dataIndex: 'address', key: '5' },
    {
      title: '操作',
      key: 'operation',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            <Icon type="tool" title="维护" onClick={e => this.onRepair(i)} />
            <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
          </div>
        );
      },
    },
  ];

  onEdit(i) {
    this.setState({ showGPForm: true });
  }

  onLocate(i) {}
  onRepair(i) {
    this.setState({ showGPRepair: true });
  }
  onCancel(i) {}

  onShowSizeChange(pn, ps) {
    this.setState(
      {
        pageNum: pn,
        pageSize: ps,
      },
      e => this.search(this.condition)
    );
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
    let rt = await Post(url_SearchResidenceMP, newCondition);
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

  async getInitData() {
    await Post(url_GetRPBZDataFromData, null, e => {
      this.setState(e);
    });
  }

  componentDidMount() {
    this.getInitData();
  }

  render() {
    let {
      showGPForm,
      showGPRepair,
      showLocateMap,
      rows,
      areas,
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
    } = this.state;

    return (
      <div className={st.GPSearch}>
        <div className={st.header}>
          <Cascader placeholder="行政区" style={{ width: '200px' }} />
          &ensp;
          <Select
            onChange={e => {
              this.condition.RoadName = e;
            }}
            placeholder="道路名称"
            showSearch
            style={{ width: '150px' }}
          />
          &ensp;
          <Select
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
            onChange={e => {
              this.condition.Material = e;
            }}
            placeholder="材质"
            style={{ width: '100px' }}
          >
            {(Material || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp;
          <Select
            onChange={e => {
              this.condition.Size = e;
            }}
            placeholder="规格"
            style={{ width: '100px' }}
          >
            {(Size || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp;
          <Select
            onChange={e => {
              this.condition.Manufacturers = e;
            }}
            placeholder="生产厂家"
            style={{ width: '150px' }}
          >
            {(Manufacturers || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp;
          <DatePicker
            onChange={e => {
              this.condition.start = e;
            }}
            placeholder="设置时间（起）"
            style={{ width: '150px' }}
          />
          &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e;
            }}
            placeholder="设置时间（止）"
            style={{ width: '150px' }}
          />
          &ensp;
          <Button icon="search" type="primary">
            搜索
          </Button>
        </div>
        <div className={st.body}>
          <Table
            bordered
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
          title="路牌编辑"
          destroyOnClose={true}
          centered={true}
          visible={showGPForm}
          onCancel={e => this.setState({ showGPForm: false })}
          footer={null}
        >
          <GPForm />
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
          <GPRepair />
        </Modal>
      </div>
    );
  }
}

export default GPSearch;
