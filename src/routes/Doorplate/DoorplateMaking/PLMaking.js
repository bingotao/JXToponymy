import { Component } from 'react';
import {
  Table,
  Pagination,
  Radio,
  Button,
  Icon,
  Select,
  Modal,
  Cascader,
  DatePicker,
  Input,
} from 'antd';
import st from './PLMaking.less';
import {
  getProducedPLMP,
  getProducedPLMP_T,
  getProducedPLMP_D,
  getNotProducedPLMP,
  getNotProducedPLMP_T,
  getNotProducedPLMP_D,
  GetProducedPLMPDetails,
  ProducePLMP,
} from '../../../services/MPMaking';

import { getDistrictsWithJX } from '../../../utils/utils.js';
import { url_GetDistrictTreeFromDistrict } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';

class PLMaking extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  getContent(content) {
    let ctts = [];
    if (content) {
      ctts = content.split(';');
    }
    return (
      <div className={st.rows}>
        {ctts.map((i, idx) => (
          <div className={st.rowitem}>
            {idx + 1}、
            {i}
          </div>
        ))}
      </div>
    );
  }

  yzzColumns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '批次号', align: 'center', dataIndex: 'PLProduceID', key: 'PLProduceID' },
    { title: '制作时间', align: 'center', dataIndex: 'MPProduceTime', key: 'MPProduceTime' },
    { title: '制作人', align: 'center', dataIndex: 'MPProduceUser', key: 'MPProduceUser' },
    {
      title: '操作',
      key: 'operation',
      width: 80,
      align: 'center',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="download" title="清单下载" onClick={e => this.onView(i)} />
          </div>
        );
      },
    },
  ];

  // wzzColumns = [
  //   { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
  //   {
  //     title: '申报信息',
  //     align: 'center',
  //     dataIndex: 'Content',
  //     key: 'Content',
  //     render: i => {
  //       return this.getContent(i);
  //     },
  //   },
  // ];
  wzzColumns = [
    { title: '批次', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    {
      title: '批量导入时间',
      align: 'center',
      dataIndex: 'CreateTime',
      key: 'CreateTime',
    },
  ];
  wzzColumnsDetail = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    // { title: '门牌类别', align: 'center', dataIndex: 'MPType', key: 'MPType' },
    { title: '行政区', width: 100, align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    {
      title: '镇街道',
      width: 100,
      align: 'center',
      dataIndex: 'NeighborhoodsName',
      key: 'NeighborhoodsName',
      render: text => (
        <div className={st.smileDark} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '村社区',
      width: 100,
      align: 'center',
      dataIndex: 'CommunityName',
      key: 'CommunityName',
      render: text => (
        <div className={st.smileDark} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '标准名称',
      width: 120,
      align: 'center',
      dataIndex: 'PlaceName',
      key: 'PlaceName',
      render: text => (
        <div className={st.smileDark} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '邮政编码',
      width: 100,
      align: 'center',
      dataIndex: 'Postcode',
      key: 'Postcode',
      render: text => (
        <div className={st.smileDark} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '申报单位',
      width: 120,
      align: 'center',
      dataIndex: 'SBDW',
      key: 'SBDW',
      render: text => (
        <div className={st.smileDark} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '申办人',
      width: 120,
      align: 'center',
      dataIndex: 'Applicant',
      key: 'Applicant',
      render: text => (
        <div className={st.smileDark} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '编制日期',
      width: 120,
      align: 'center',
      dataIndex: 'BZTime',
      key: 'BZTime',
      render: text => (
        <div className={st.smileDark} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: '制作数量',
      align: 'center',
      dataIndex: 'totalCount',
      key: 'totalCount',
      render: text => (
        <div className={st.smileDark} title={text}>
          {text}
        </div>
      ),
    },
  ];

  condition = {
    MPType: '住宅门牌',
  };

  state = {
    PLMPProduceComplete: 0,
    PageSize: 10,
    PageNum: 1,
    total: 0,
    rows: [],
    selectedRows: [],
    loading: false,
    y: 0,
    showFooter: false,
    districts: [],
    expandData: {},
    expandLoading: {},
  };

  componentDidMount() {
    this.getDistricts();
    this.search();
  }
  expandRowClick(expanded, record) {
    let { expandData, expandLoading, PLMPProduceComplete } = this.state;
    let id = PLMPProduceComplete ? record.PLProduceID : record.PLID;

    if (!expandData[id]) {
      expandLoading[id] = true;
      this.setState({ expandLoading: expandLoading });
      PLMPProduceComplete
        ? getProducedPLMP_D({ MPType: this.condition.MPType, PLProduceID: id }, e => {
            let data = [];
            e.map((item, idx) => {
              item.index = idx + 1;
              let countyname = [];
              item.CountyID.map((d, i) => {
                countyname.push(d.split('.')[1]);
              });
              item.CountyName = countyname.join(';');

              let neighborhoodsname = [];
              item.NeighborhoodsID.map((d, i) => {
                neighborhoodsname.push(d.split('.')[2]);
              });
              item.NeighborhoodsName = neighborhoodsname.join('；');
              item.CommunityName = item.CommunityName.join('；');
              item.Postcode = item.Postcode.join('；');
              item.SBDW = item.SBDW.join('；');
              item.Applicant = item.Applicant.join('；');
              item.BZTime = item.BZTime.join('；');
              data.push(item);
            });
            expandData[id] = data;
            this.setState({ expandData: expandData }, () => {
              expandLoading[id] = false;
              this.setState({ expandLoading: expandLoading });
            });
          })
        : getNotProducedPLMP_D({ MPType: this.condition.MPType, PLID: id }, e => {
            let data = [];
            e.map((item, idx) => {
              item.index = idx + 1;
              let countyname = [];
              item.CountyID.map((d, i) => {
                countyname.push(d.split('.')[1]);
              });
              item.CountyName = countyname.join(';');

              let neighborhoodsname = [];
              item.NeighborhoodsID.map((d, i) => {
                neighborhoodsname.push(d.split('.')[2]);
              });
              item.NeighborhoodsName = neighborhoodsname.join('；');
              item.CommunityName = item.CommunityName.join('；');
              item.Postcode = item.Postcode.join('；');
              item.SBDW = item.SBDW.join('；');
              item.Applicant = item.Applicant.join('；');
              item.BZTime = item.BZTime.join('；');
              data.push(item);
            });
            expandData[id] = data;
            this.setState({ expandData: expandData }, () => {
              expandLoading[id] = false;
              this.setState({ expandLoading: expandLoading });
            });
          });
    }
  }
  expandedRowRender(record, index, indent, expanded) {
    let { expandData, expandLoading, PLMPProduceComplete } = this.state;
    let id = PLMPProduceComplete ? record.PLProduceID : record.PLID;
    return (
      <div className={st.childTab}>
        <Table
          columns={this.wzzColumnsDetail}
          dataSource={expandData[id]}
          pagination={false}
          loading={expandLoading[id]}
        />
      </div>
    );
  }

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistrictsWithJX(e);
      this.setState({ districts: districts });
    });
  }

  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }

  onShowSizeChange(pn, ps) {
    this.setState(
      {
        PageNum: pn,
        PageSize: ps,
      },
      e => this.search()
    );
  }

  async search(pageSize, pageNum) {
    let { PageNum, PageSize, PLMPProduceComplete } = this.state;
    PageNum = pageNum || PageNum;
    PageSize = pageSize || PageSize;

    this.setState({ loading: true });

    let newCondition = {
      ...this.condition,
      PageSize: PageSize,
      PageNum: PageNum,
    };

    if (PLMPProduceComplete === 0) {
      await getNotProducedPLMP_T(newCondition, e => {
        let { Count, Data } = e;
        this.setState({
          selectedRows: [],
          total: Count,
          showFooter: false,
          rows: Data.map((item, idx) => {
            item.key = item.MPID;
            item.index = (PageNum - 1) * PageSize + idx + 1;
            return item;
          }),
        });
      });
    } else {
      await getProducedPLMP_T(newCondition, e => {
        let { Count, Data } = e;
        Data.map((item, idx) => {
          item.index = (PageNum - 1) * PageSize + idx + 1;
        });
        this.setState({
          selectedRows: [],
          rows: Data,
          total: Count,
          showFooter: true,
        });
      });
    }
    this.setState({ loading: false });
  }

  making() {
    let { selectedRows } = this.state;

    if (selectedRows && selectedRows.length) {
      if (!this.condition.MPType) {
        error('请选择门牌类型！');
      } else {
        let ids = [];
        let { rows } = this.state;
        for (let i of selectedRows) {
          ids.push(rows[i].PLID);
        }
        console.log(ids);
        ProducePLMP({ PLIDs: ids, MPType: this.condition.MPType }, e => {
          this.search();
        });
      }
    } else {
      error('请选择要制作的门牌！');
    }
  }

  onView(i) {
    GetProducedPLMPDetails(i.PLProduceID);
  }

  render() {
    var {
      PLMPProduceComplete,
      PageSize,
      PageNum,
      total,
      rows,
      selectedRows,
      loading,
      showFooter,
      districts,
    } = this.state;

    let columns = PLMPProduceComplete == 1 ? this.yzzColumns : this.wzzColumns;
    return (
      <div className={st.PLMaking}>
        <div className={st.header}>
          <Cascader
            allowClear
            expandTrigger="hover"
            placeholder="行政区"
            style={{ width: '200px' }}
            changeOnSelect
            options={districts}
            onChange={e => {
              this.condition.DistrictID = e && e.length ? e[e.length - 1] : undefined;
            }}
          />
          &emsp;
          <Select
            defaultValue={this.condition.MPType}
            style={{ width: 120 }}
            onChange={e => {
              this.condition.MPType = e;
            }}
          >
            <Select.Option value="住宅门牌">住宅门牌</Select.Option>
            <Select.Option value="道路门牌">道路门牌</Select.Option>
            <Select.Option value="农村门牌">农村门牌</Select.Option>
          </Select>
          &emsp;
          <Select
            defaultValue={PLMPProduceComplete}
            style={{ width: 90 }}
            onChange={e => {
              if (PLMPProduceComplete !== e) {
                this.setState({
                  PLMPProduceComplete: e,
                  total: 0,
                  rows: [],
                  selectedRows: [],
                  PageNum: 1,
                  showFooter: !!e,
                });
              }
            }}
          >
            <Select.Option value={0}>未制作</Select.Option>
            <Select.Option value={1}>已制作</Select.Option>
          </Select>
          &emsp;
          <Input
            placeholder="标准名称"
            style={{ width: '160px' }}
            onChange={e => (this.condition.Name = e.target.value)}
            allowClear={true}
          />
          &emsp;
          {/*
          <Radio.Group
            defaultValue={PLMPProduceComplete}
            buttonStyle="solid"
            onChange={e => {
              this.setState({
                PLMPProduceComplete: e.target.value,
                total: 0,
                rows: [],
                selectedRows: [],
                PageNum: 1,
                showFooter: !!e.target.value,
              });
            }}
          >
            <Radio.Button value={0}>未制作</Radio.Button>
            <Radio.Button value={1}>已制作</Radio.Button>
          </Radio.Group>
          */}
          <Input
            placeholder="申报单位"
            style={{ width: '160px' }}
            onChange={e => (this.condition.SBDW = e.target.value)}
            allowClear={true}
          />
          &emsp;
          <DatePicker
            onChange={e => {
              this.condition.start = e && e.format('YYYY-MM-DD');
            }}
            placeholder={PLMPProduceComplete === 0 ? '导入日期（起）' : '制作日期（起）'}
            style={{ width: '150px' }}
          />
          &ensp;~ &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e && e.format('YYYY-MM-DD');
            }}
            placeholder={PLMPProduceComplete === 0 ? '导入日期（止）' : '制作日期（止）'}
            style={{ width: '150px' }}
          />
          &emsp;
          <Button type="primary" icon="search" onClick={e => this.search(undefined, 1)}>
            搜索
          </Button>
          &emsp;
          {this.getEditComponent(
            PLMPProduceComplete === 0 && (
              <Button
                type="primary"
                icon="form"
                disabled={!selectedRows.length}
                onClick={this.making.bind(this)}
              >
                制作
              </Button>
            )
          )}
        </div>
        <div
          ref={e => {
            this.body = e;
          }}
          className={st.body}
        >
          <Table
            bordered
            rowSelection={
              PLMPProduceComplete
                ? false
                : {
                    selectedRowKeys: selectedRows,
                    onChange: e => {
                      console.log(e);
                      this.setState({ selectedRows: e });
                    },
                  }
            }
            pagination={false}
            columns={columns}
            dataSource={rows}
            loading={loading}
            defaultExpandAllRows={true}
            expandedRowRender={(record, index, indent, expanded) =>
              this.expandedRowRender(record, index, indent, expanded)
            }
            onExpand={(expanded, record) => {
              this.expandRowClick(expanded, record);
            }}
          />
        </div>
        <div className={st.footer}>
          <Pagination
            showSizeChanger
            onShowSizeChange={(page, size) => this.onShowSizeChange(1, size)}
            current={PageNum}
            pageSize={PageSize}
            total={total}
            pageSizeOptions={[25, 50, 100, 200]}
            onChange={this.onShowSizeChange.bind(this)}
            showTotal={(total, range) =>
              total ? `共：${total} 条，当前：${range[0]}-${range[1]} 条` : ''
            }
          />
        </div>
      </div>
    );
  }
}

export default PLMaking;
