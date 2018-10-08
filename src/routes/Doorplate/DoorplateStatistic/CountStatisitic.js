import { Component } from 'react';

import { Cascader, DatePicker, Button, Table } from 'antd';

import st from './CountStatisitic.less';

class CountStatisitic extends Component {
    state = {
        loading: false,
        rows: []
    }

    queryCondition = {};

    columns = [
        { title: '序号', dataIndex: 'index', key: 'index' },
        { title: '市辖区', dataIndex: 'index', key: 'index' },
        { title: '镇街道', dataIndex: 'index', key: 'index' },
        { title: '办理类型', dataIndex: 'index', key: 'index' },
        { title: '数量', dataIndex: 'index', key: 'index' },
    ];

    render() {
        let { loading, rows } = this.state;
        return (<div className={st.CountStatisitic}>
            <div className={st.condition}>
                <Cascader placeholder="行政区" style={{ width: '200px' }} />
                &emsp;
                <DatePicker
                    onChange={e => {
                        this.condition.start = e;
                    }}
                    placeholder="办理时间（起）"
                    style={{ width: '150px' }}
                />
                &ensp;~ &ensp;
                <DatePicker
                    onChange={e => {
                        this.condition.end = e;
                    }}
                    placeholder="办理时间（止）"
                    style={{ width: '150px' }}
                />
                &emsp;
                &emsp;
                <Button type="primary" icon="pie-chart">统计</Button>
            </div>
            <div className={st.result}>
                <Table bordered columns={this.columns} data={rows}></Table>
            </div>
        </div>);
    }
}

export default CountStatisitic;