import { Component } from 'react';
import { Button, Table, Cascader, DatePicker, Select } from 'antd';
import st from './GPCount.less';

class GPCount extends Component {

    state = {
        loading: false,
        rows: []
    }

    condition = {}

    columns = [
        { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
        { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
        {
            title: '镇（街道）',
            align: 'center',
            dataIndex: 'NeighborhoodsName',
            key: 'NeighborhoodsName',
        },
        { title: '村社区', align: 'center', dataIndex: 'RoadName', key: 'RoadName' },
        { title: '道路名称', align: 'center', dataIndex: 'Intersection', key: 'Intersection' },
        { title: '样式', align: 'center', dataIndex: 'Direction', key: 'Direction' },
        { title: '材质', align: 'center', dataIndex: 'BZTime', key: 'BZTime' },
        { title: '规格', align: 'center', dataIndex: 'address', key: '5' },
        { title: '数量', align: 'center', dataIndex: 'address', key: '5' },
    ];

    render() {
        let { loading, rows } = this.state;
        return (<div className={st.GPCount}>
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
                    placeholder="道路名称"
                    showSearch
                    style={{ width: '150px' }}
                />
                &emsp;
          <Select
                    onChange={e => {
                        this.condition.Direction = e;
                    }}
                    placeholder="样式"
                    showSearch
                    style={{ width: '100px' }}
                >

                </Select>
                &emsp;
          <Select
                    onChange={e => {
                        this.condition.Material = e;
                    }}
                    placeholder="材质"
                    style={{ width: '100px' }}
                >

                </Select>
                &emsp;
          <Select
                    onChange={e => {
                        this.condition.Size = e;
                    }}
                    placeholder="规格"
                    style={{ width: '100px' }}
                >

                </Select>
                &emsp;
          <DatePicker
                    onChange={e => {
                        this.condition.start = e;
                    }}
                    placeholder="设置时间（起）"
                    style={{ width: '150px' }}
                />
                &ensp;~ &ensp;
          <DatePicker
                    onChange={e => {
                        this.condition.end = e;
                    }}
                    placeholder="设置时间（止）"
                    style={{ width: '150px' }}
                />
                &emsp;
                <Button type="primary" icon="pie-chart">统计</Button>
            </div>
            <div className={st.result}>
                <Table bordered columns={this.columns} data={rows} />
            </div>
        </div>)
    }
}

export default GPCount;