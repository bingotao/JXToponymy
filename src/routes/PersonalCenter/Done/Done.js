import { Component } from 'react';

import { Select, Button, Pagination, Spin, Icon, DatePicker } from 'antd';
import { qlsx, sbly, getQLSXUrl, selfSystemUrl  } from '../../../common/enums';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';
import { GetDoneItems } from '../../../services/PersonalCenter';
import { getUser } from '../../../utils/login';
import { error } from '../../../utils/notification';

let defaultCondition = {
  LX: '地名证明',
  SBLY: '一窗受理',
  start: moment().subtract(7, 'day').format('YYYY-MM-DD'),
  end: moment()
    .format('YYYY-MM-DD'),
};

class Class extends Component {
  state = {
    pageSize: 20,
    pageNum: 1,
    total: 0,
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
    await GetDoneItems(newCondition, d => {
      let data = d.Data,
        count = d.Count;
      data = data || [];
      this.queryCondition = newCondition;
      let { pageNum, pageSize } = this.state;
      data.map((r, i) => (r.index = (pageNum - 1) * pageSize + 1 + i));
      this.setState({ total: count, rows: data });
    });
    this.setState({ loading: false });
  }

  getTable() {
    let { LX, rows, loading } = this.state;
    switch (LX) {
      case '门牌编制':
        return (
          <DataGrid
            id="门牌编制"
            key="门牌编制"
            data={rows}
            style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
          >
            <GridColumn field="index" title="序号" align="center" width="80px" />
            <GridColumn field="YWLX" title="业务类型" align="center" width={180} />
            <GridColumn field="MPLX" title="门牌类型" align="center" width={140} />
            <GridColumn field="SBLY" title="申报来源" align="center" width={140} />
            <GridColumn field="CQR" title="申请人" align="center" width={140} />
            <GridColumn field="SQSJ" title="申请时间" align="center" width={140} />
            <GridColumn field="SPSJ" title="审批时间" align="center" width={140} />
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
                        <Icon type="edit" title="查看" onClick={e => this.onEdit(i)} />
                      </div>
                    );
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
        );
      case '地名证明':
        return (
          <DataGrid
            id="地名证明"
            key="地名证明"
            data={rows}
            style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
          >
            <GridColumn field="index" title="序号" align="center" width="80px" />
            <GridColumn field="MC" title="名称" align="center" width={180} />
            <GridColumn field="MPLX" title="门牌类型" align="center" width={140} />
            <GridColumn field="SBLY" title="申报来源" align="center" width={140} />
            <GridColumn field="SQSJ" title="申请时间" align="center" width={140} />
            <GridColumn field="SPSJ" title="审批时间" align="center" width={140} />
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
                        <Icon type="edit" title="查看" onClick={e => this.onEdit(i)} />
                      </div>
                    );
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
        );
      case '地名核准':
        return (
          <DataGrid
            id="地名核准"
            key="地名核准"
            data={rows}
            style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
          >
            <GridColumn field="index" title="序号" align="center" width="80px" />
            <GridColumn field="DMLB" title="地名类别" align="center" width={180} />
            <GridColumn field="XLLB" title="小类类别" align="center" width={140} />
            <GridColumn field="NYMC" title="拟用名称" align="center" width={140} />
            <GridColumn field="SBLY" title="申报来源" align="center" width={140} />
            <GridColumn field="SQSJ" title="申请时间" align="center" width={140} />
            <GridColumn field="SPSJ" title="审批时间" align="center" width={140} />
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
                        <Icon type="edit" title="查看" onClick={e => this.onEdit(i)} />
                      </div>
                    );
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
        );
      case '出具意见':
        return (
          <DataGrid
            id="出具意见"
            key="出具意见"
            data={rows}
            style={{ height: '100%', filter: `blur(${loading ? '1px' : 0})` }}
          >
            <GridColumn field="index" title="序号" align="center" width="80px" />
            <GridColumn field="LB" title="类别" align="center" width={180} />
            <GridColumn field="DMLB" title="地名类别" align="center" width={180} />
            <GridColumn field="XLLB" title="小类类别" align="center" width={180} />
            <GridColumn field="MC" title="名称" align="center" width={140} />
            <GridColumn field="SBLY" title="申报来源" align="center" width={140} />
            <GridColumn field="SQSJ" title="申请时间" align="center" width={140} />
            <GridColumn field="SPSJ" title="审批时间" align="center" width={140} />
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
                        <Icon type="edit" title="查看" onClick={e => this.onEdit(i)} />
                      </div>
                    );
                  }}
                />
              </GridHeaderRow>
            </GridColumnGroup>
          </DataGrid>
        );
    }
  }

  onEdit(i) {
    let { ID, SIGN } = i;
    let user = getUser();
    if (user) {
      let newUrl = `${selfSystemUrl}?id=${ID}&yj=1&userid=${user.userId}&username=${
        user.userName
      }&target=${SIGN}`;
      window.open(newUrl, '_blank');
    } else {
      error('请先登录');
    }
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
              this.setState({ pageNum: 1 });
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
              this.setState({ LX: e, rows: [], total: 0, pageNum: 1 });
            }}
            style={{ width: '120px' }}
          >
            {qlsx.map(i => <Select.Option value={i.id}>{i.name}</Select.Option>)}
          </Select>
          <DatePicker
            defaultValue={moment(this.condition.start)}
            onChange={e => {
              this.condition.start = e && e.format('YYYY-MM-DD');
            }}
            placeholder="查看时间（起）"
          />
          <DatePicker
            defaultValue={moment(this.condition.end)}
            onChange={e => {
              this.condition.end = e && e.format('YYYY-MM-DD');
            }}
            placeholder="查看时间（止）"
          />
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
              let { total, pageSize, pageNum, rows } = this.state;
              return total ? (
                <span>
                  共&ensp;<strong>{total}</strong>&ensp;条，当前&ensp;<strong>
                    {(pageNum - 1) * pageSize + 1}
                  </strong>&ensp;-&ensp;<strong>{(pageNum - 1) * pageSize + rows.length}</strong>&ensp;条&emsp;
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
