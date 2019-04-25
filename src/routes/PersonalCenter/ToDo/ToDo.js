import { Component } from 'react';

import { Select, Button, Pagination, Spin, Icon } from 'antd';
import { qlsx, sbly } from '../../../common/enums';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';
import { GetTodoItems } from '../../../services/PersonalCenter';

let defaultCondition = {
  LX: '地名证明',
  SBLY: '一窗受理',
};

class Class extends Component {
  constructor(ps) {
    super(ps);
    if (ps.history.location.state) {
      let { SBLY, LX } = ps.history.location.state;
      if (SBLY && LX) {
        this.condition = { SBLY, LX };
        this.queryCondition = { SBLY, LX };
        this.state.LX = LX;
        this.state.SBLY = SBLY;
      }
    }
  }

  state = {
    pageSize: 20,
    pageNum: 1,
    total: 100,
    rows: [],
    loading: false,
    ...defaultCondition,
  };
  condition = { ...defaultCondition };
  queryCondition = { ...defaultCondition };

  async search(condition) {
    let { pageSize, pageNum } = this.state;
    let newCondition = {
      ...(condition || this.condition),
      pageSize,
      pageNum,
    };

    console.log(newCondition);
    this.setState({ loading: true });
    await GetTodoItems(newCondition, d => {
      d = d || [];
      this.queryCondition = newCondition;
      let { pageNum, pageSize } = this.state;
      d.map((r, i) => (r.index = (pageNum - 1) * pageSize + 1 + i));
    });
    this.setState({ loading: false });
  }

  getTable() {
    let { LX, rows, loading } = this.state;
    let table = null;
    switch (LX) {
      case '门牌编制':
        table = (
          <DataGrid
            key="门牌编制"
            data={rows}
            style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
          >
            <GridColumn field="index" title="序号" align="center" width="80px" />
            <GridColumn field="AddressCoding" title="申请类型" align="center" width={180} />
            <GridColumn field="NeighborhoodsName" title="镇街道" align="center" width={140} />
            <GridColumn field="NeighborhoodsName" title="门牌类型" align="center" width={140} />
            <GridColumn field="BZTime" title="编制日期" align="center" width={140} />
            <GridColumn field="BZTime" title="申请人" align="center" width={140} />
            <GridColumnGroup frozen align="right" width="120px">
              <GridHeaderRow>
                <GridColumn
                  field="operation"
                  title="操作"
                  align="center"
                  render={({ value, row, rowIndex }) => {
                    let i = row;
                    return (
                      <div className="rowbtns">
                        <Icon type="edit" title="办理" onClick={e => this.onEdit(i)} />
                      </div>
                    );
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
        );
        break;
      case '地名证明':
        table = (
          <DataGrid
            key="地名证明"
            data={rows}
            style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
          >
            <GridColumn field="index" title="序号" align="center" width="80px" />
            <GridColumn field="AddressCoding" title="申请类型" align="center" width={180} />
            <GridColumn field="NeighborhoodsName" title="门牌类型" align="center" width={140} />
            <GridColumn field="BZTime" title="申请人" align="center" width={140} />
            <GridColumnGroup frozen align="right" width="120px">
              <GridHeaderRow>
                <GridColumn
                  field="operation"
                  title="操作"
                  align="center"
                  render={({ value, row, rowIndex }) => {
                    let i = row;
                    return (
                      <div className="rowbtns">
                        <Icon type="edit" title="办理" onClick={e => this.onEdit(i)} />
                      </div>
                    );
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
        );
        break;

      case '地名核准':
        table = (
          <DataGrid
            key="地名核准"
            data={rows}
            style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
          >
            <GridColumn field="index" title="序号" align="center" width="80px" />
            <GridColumn field="AddressCoding" title="申请类型" align="center" width={180} />
            <GridColumn field="NeighborhoodsName" title="门牌类型" align="center" width={140} />
            <GridColumn field="BZTime" title="申请人" align="center" width={140} />
            <GridColumnGroup frozen align="right" width="120px">
              <GridHeaderRow>
                <GridColumn
                  field="operation"
                  title="操作"
                  align="center"
                  render={({ value, row, rowIndex }) => {
                    let i = row;
                    return (
                      <div className="rowbtns">
                        <Icon type="edit" title="办理" onClick={e => this.onEdit(i)} />
                      </div>
                    );
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
        );
        break;

      case '出具意见':
        table = (
          <DataGrid
            key="出具意见"
            data={rows}
            style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
          >
            <GridColumn field="index" title="序号" align="center" width="80px" />
            <GridColumn field="AddressCoding" title="申请类型" align="center" width={180} />
            <GridColumn field="NeighborhoodsName" title="门牌类型" align="center" width={140} />
            <GridColumn field="BZTime" title="申请人" align="center" width={140} />
            <GridColumnGroup frozen align="right" width="120px">
              <GridHeaderRow>
                <GridColumn
                  field="operation"
                  title="操作"
                  align="center"
                  render={({ value, row, rowIndex }) => {
                    let i = row;
                    return (
                      <div className="rowbtns">
                        <Icon type="edit" title="办理" onClick={e => this.onEdit(i)} />
                      </div>
                    );
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
        );
        break;
    }
    return table;
  }

  componentDidMount() {
    this.search();
  }

  render() {
    let { total, row, loading, pageSize, pageNum } = this.state;
    return (
      <div className="ct-sc">
        <div className="ct-sc-hd">
          <Select
            allowClear={false}
            placeholder="申报来源"
            defaultValue={this.condition.SBLY}
            onChange={e => {
              this.condition.SBLY = e;
              this.setState({ pageNum: 1, rows: [], total: 0, pageNum: 1 }, e => this.search());
            }}
            style={{ width: '120px' }}
          >
            {sbly.map(i => <Select.Option value={i.id}>{i.name}</Select.Option>)}
          </Select>
          <Select
            allowClear={false}
            defaultValue={this.condition.LX}
            onChange={e => {
              this.condition.LX = e;
              this.setState({ LX: e, rows: [], total: 0, pageNum: 1 }, e => this.search());
            }}
            style={{ width: '120px' }}
          >
            {qlsx.map(i => <Select.Option value={i.id}>{i.name}</Select.Option>)}
          </Select>
          <Button
            type="primary"
            icon="search"
            onClick={e => {
              this.setState({ pageNum: 1 }, e => this.search());
            }}
          >
            查询
          </Button>
        </div>
        <div className="ct-sc-bd">
          {loading ? <Spin tip="数据加载中..." wrapperClassName="ct-sc-loading" /> : null}
          {this.getTable()}
        </div>
        <div className="ct-sc-ft">
          <Pagination
            showTotal={(t, rg) => {
              let { total, pageSize, pageNum } = this.state;
              return total ? (
                <span>
                  共&ensp;<strong>{total}</strong>&ensp;条，当前&ensp;<strong>
                    {(pageNum - 1) * pageSize + 1}
                  </strong>&ensp;-&ensp;<strong>{pageNum * pageSize}</strong>&ensp;条&emsp;
                </span>
              ) : (
                ''
              );
            }}
            total={total}
            current={pageNum}
            pageSize={pageSize}
            pageSizeOptions={[20, 50, 100, 200]}
            showSizeChanger
            onShowSizeChange={(pn, ps) => {
              this.setState({ pageNum: 1, pageSize: ps }, e => this.search(this.queryCondition));
            }}
            onChange={(pn, ps) => {
              this.setState({ pageNum: pn }, e => this.search(this.queryCondition));
            }}
          />
        </div>
      </div>
    );
  }
}

export default Class;
