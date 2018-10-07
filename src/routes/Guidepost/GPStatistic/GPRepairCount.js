import { Component } from 'react';
import { Input, Icon, Button, Table, Cascader, DatePicker, Select, Pagination } from 'antd';
import st from './GPRepairCount.less';

class GPRepairCount extends Component {

    state = {
        loading: false,
        rows: [],
        total: 0,
        pageSize: 25,
        pageNum: 1,
    }

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

    onShowSizeChange() {

    }

    render() {
        let { loading, rows, pageSize, total, pageNum } = this.state;
        return (<div className={st.GPRepairCount}>
            <div className={st.condition}>
                <Cascader placeholder="行政区" style={{ width: '200px' }} />
                &emsp;
                <Select
                    onChange={e => {
                        this.condition.Intersection = e;
                    }}
                    placeholder="村社区"
                    showSearch
                    style={{ width: '150px' }}
                >

                </Select>
                &emsp;
          <Select
                    onChange={e => {
                        this.condition.RoadName = e;
                    }}
                    placeholder="维护方式"
                    showSearch
                    style={{ width: '150px' }}
                />
                &emsp;
                <Input placeholder="维修次数" style={{ width: '100px' }} />
                &emsp;
          <Select
                    onChange={e => {
                        this.condition.Direction = e;
                    }}
                    placeholder="维修部位"
                    showSearch
                    style={{ width: '100px' }}
                >

                </Select>
                &emsp;
                <Input placeholder="维修内容" style={{ width: '100px' }} />
                &emsp;
                <Select
                    onChange={e => {
                        this.condition.Material = e;
                    }}
                    placeholder="维修厂家"
                    style={{ width: '100px' }}
                >
                </Select>
                &emsp;
          <DatePicker
                    onChange={e => {
                        this.condition.start = e;
                    }}
                    placeholder="修复时间（起）"
                    style={{ width: '150px' }}
                />
                &ensp;~ &ensp;
          <DatePicker
                    onChange={e => {
                        this.condition.end = e;
                    }}
                    placeholder="修复时间（止）"
                    style={{ width: '150px' }}
                />
                &emsp;
                <Button type="primary" icon="pie-chart">查询</Button>
            </div>
            <div className={st.result}>
                <Table bordered columns={this.columns} data={rows} />
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
                />/>
            </div>
        </div>)
    }
}

export default GPRepairCount;