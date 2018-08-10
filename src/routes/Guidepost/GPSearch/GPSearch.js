import React, { Component } from 'react';
import { Tabs, Input, Cascader, Button, DatePicker, Table, Pagination, Icon } from 'antd';
import st from './GPSearch.less';

class GPSearch extends Component {
  columns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '市辖区', dataIndex: 'name', key: 'name' },
    { title: '镇（街道）', dataIndex: 'age', key: 'age' },
    { title: '道路名称', dataIndex: 'address', key: '1' },
    { title: '设置路口', dataIndex: 'address', key: '2' },
    { title: '设置方向', dataIndex: 'address', key: '3' },
    { title: '设置时间', dataIndex: 'address', key: '4' },
    { title: '维修次数', dataIndex: 'address', key: '5' },
    {
      title: '操作',
      key: 'operation',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            <Icon type="tool" title="维护" onClick={e => this.onLocate(i)} />
            <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
          </div>
        );
      },
    },
  ];

  render() {
    return (
      <div className={st.GPSearch}>
        <Tabs>
          <Tabs.TabPane tab="路牌查询" key="1">
            <Cascader placeholder="行政区" style={{ width: '200px', marginRight: '10px' }} />
            <Input placeholder="二维码编号" style={{ width: '150px', marginRight: '10px' }} />
            <Input placeholder="道路名称" style={{ width: '150px', marginRight: '10px' }} />
            <Input placeholder="样式" style={{ width: '150px', marginRight: '10px' }} />
            <Input placeholder="材质" style={{ width: '150px', marginRight: '10px' }} />
            <div style={{ margin: '10px 0' }} />
            <Input placeholder="规格" style={{ width: '200px', marginRight: '10px' }} />
            <Input placeholder="生产厂家" style={{ width: '150px', marginRight: '10px' }} />
            <DatePicker
              placeholder="设置时间（起）"
              style={{ width: '150px', marginRight: '10px' }}
            />
            <DatePicker
              placeholder="设置时间（止）"
              style={{ width: '150px', marginRight: '10px' }}
            />
            <Button icon="search" type="primary">
              搜索
            </Button>
          </Tabs.TabPane>
          <Tabs.TabPane tab="维护查询" key="2">
            <Cascader placeholder="行政区" style={{ width: '200px', marginRight: '10px' }} />
            <Input placeholder="维护方式" style={{ width: '150px', marginRight: '10px' }} />
            <Input placeholder="维护次数" style={{ width: '150px', marginRight: '10px' }} />
            <Input placeholder="维护部门" style={{ width: '150px', marginRight: '10px' }} />
            <Input placeholder="维修厂家" style={{ width: '150px', marginRight: '10px' }} />
            <div style={{ margin: '10px 0' }} />
            <Input placeholder="维修内容" style={{ width: '200px', marginRight: '10px' }} />
            <DatePicker
              placeholder="修复时间（起）"
              style={{ width: '150px', marginRight: '10px' }}
            />
            <DatePicker
              placeholder="修复时间（止）"
              style={{ width: '150px', marginRight: '10px' }}
            />
            <Button icon="search" type="primary">
              搜索
            </Button>
          </Tabs.TabPane>
        </Tabs>
        <div className={st.body}>
          <Table columns={this.columns} dataSource={[{}]} pagination={false} />
        </div>
        <div className={st.footer}>
          <Pagination />
        </div>
      </div>
    );
  }
}

export default GPSearch;
