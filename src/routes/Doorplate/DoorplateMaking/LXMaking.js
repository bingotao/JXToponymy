import React, { Component } from 'react';
import { Cascader, Input, Button, Pagination, Table, Icon } from 'antd';
import st from './LXMaking.less';

const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    index: i + 1,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}

class LXMaking extends Component {
  columns = [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '市辖区', dataIndex: 'name', key: 'name' },
    { title: '镇（街道）', dataIndex: 'age', key: 'age' },
    { title: '村（社区）', dataIndex: 'address', key: '1' },
    { title: '标准地名', dataIndex: 'address', key: '3' },
    { title: '门牌号码', dataIndex: 'address', key: '2' },
    { title: '门牌规格', dataIndex: 'address', key: '4' },
    { title: '邮政编码', dataIndex: 'address', key: '5' },
    { title: '编制日期', dataIndex: 'address', key: '5' },
    {
      title: '操作',
      key: 'operation',
      width: 160,
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="file-add" title="添加至制作清单" />
          </div>
        );
      },
    },
  ];

  render() {
    return (
      <div className={st.LXMaking}>
        <div className={st.header}>
          <Cascader placeholder="请选择行政区" style={{ width: '300px' }} expandTrigger="hover" />
          <Input
            placeholder="小区名称/道路名称/自然村名称"
            style={{ width: '260px', marginLeft: '10px' }}
          />
          <Button type="primary" icon="search" style={{ marginLeft: '10px' }}>
            搜索
          </Button>
          &emsp;&emsp;
          <Button type="primary" icon="delete" style={{ marginLeft: '10px' }}>
            清空制作清单
          </Button>
          <Button type="primary" icon="form" disabled={true} style={{ marginLeft: '10px' }}>
            制作门牌
          </Button>
        </div>
        <div className={st.body}>
          <Table pagination={false} columns={this.columns} dataSource={data} />
        </div>
        <div className={st.footer}>
          <Pagination />
        </div>
      </div>
    );
  }
}

export default LXMaking;
