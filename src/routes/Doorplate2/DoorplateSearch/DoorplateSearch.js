import React, { Component } from 'react';
import { Tabs, Cascader, Select, Button, Table, Divider, Tooltip, Popconfirm, Modal, Input, Pagination, message } from 'antd';
import Navs from '../../../common/Navs/Navs';
import Panel from '../../../common/Panel/Panel';
import st from './DoorplateSearch.less';
import Map from './Map';
import WrappedEditZZForm from './EditZZ';


const TabPane = Tabs.TabPane;
const Option = Select.Option;

class DoorplateSearch extends Component {
  state = {
    visibleMap_zz: false,
    visibleEdit_zz: false,
    DistricData_zz: null,
    DistrictID_zz: null,
    inputValue_zz: null,
    tableData_zz: null,
    totalCount_zz: 0,
    detailsData_zz: null,
    currentPageNum: 1,
  };
  pageSize = 8;
  columns_zz = [
    {
      title: '市辖区',
      dataIndex: 'CountyName',
      key: 'CountyName',
    },
    {
      title: '镇街道',
      dataIndex: 'NeighborhoodsName',
      key: 'NeighborhoodsName',
    },
    {
      title: '村社区',
      dataIndex: 'CommunityName',
      key: 'CommunityName',
    },
    {
      title: '标准地名',
      dataIndex: 'PlaceName',
      key: 'PlaceName',
    },
    {
      title: '标准地址',
      dataIndex: 'StandardAddress',
      key: 'StandardAddress',
    },
    {
      title: '产权人',
      dataIndex: 'PropertyOwner',
      key: 'PropertyOwner',
    },
    {
      title: '编制日期',
      dataIndex: 'CreateTime',
      key: 'CreateTime',
      sorter: (a, b) => a.CreateTime - b.CreateTime,
    },
    {
      title: '操作',
      key: 'cz',
      render: (text, record) => (
        <span>
          <Tooltip placement="top" title={'定位'}>
            <span className="iconfont icon-location" onClick={() => this.showMap(record.key)} />
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip placement="top" title={'编辑'}>
            <span className="iconfont icon-bianji" onClick={() => this.showEdit_zz(record.key)} />
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip placement="top" title={'注销'}>
            <Popconfirm title="是否确定注销?" onConfirm={() => this.onDelete_zz(record.key)}>
              <span className="iconfont icon-zhuxiaologout9" />
            </Popconfirm>
          </Tooltip>
        </span>
      ),
    },
  ];
  componentDidMount() {
    $.post(
      "http://localhost:52141/Common/GetUserDistrictsTree",
      {
      },
      rt => {
        var temp = JSON.parse(JSON.stringify(rt.Data).replace(/ID/g, "value"));
        temp = JSON.parse(JSON.stringify(temp).replace(/Name/g, "label"));
        temp = JSON.parse(JSON.stringify(temp).replace(/SubDistrict/g, "children"));
        this.setState({ DistricData_zz: temp });
      },
      'json'
    )
  }
  SearchResidenceMP = (pSize, pNum) => {
    $.post(
      "http://localhost:52141/MPSearch/SearchResidenceMP",
      {
        PageSize: pSize,
        PageNum: pNum,
        DistrictID: this.state.DistrictID_zz,
        Name: this.state.inputValue_zz,
      },
      rt => {
        if (rt.ErrorMessage) {
          message.error(rt.ErrorMessage);
        }
        else if (rt.Data) {
          var temp = JSON.parse(JSON.stringify(rt.Data).replace(/ID/g, "key"));
          this.setState({ tableData_zz: temp.Data, totalCount_zz: temp.Count });
        }
      },
      'json'
    )
  }
  showMap(key) {
    $.post(
      "http://localhost:52141/MPSearch/SearchResidenceMPByID",
      {
        ID: key,
      },
      rt => {
        if (rt.ErrorMessage) {
          message.error(rt.ErrorMessage);
        }
        else if (rt.Data) {
          this.setState({ detailsData_zz: rt.Data, visibleMap_zz: true });
        }
      },
      'json'
    );
  }
  showEdit_zz(key) {
    $.post(
      "http://localhost:52141/MPSearch/SearchResidenceMPByID",
      {
        ID: key,
      },
      rt => {
        if (rt.ErrorMessage) {
          message.error(rt.ErrorMessage);
        }
        else if (rt.Data) {
          this.setState({ detailsData_zz: rt.Data, visibleEdit_zz: true });
        }
      },
      'json'
    );
  }
  cascaderChange_zz = (value) => {
    console.log(value);
  };

  selectChange_zz = value => {
    if (value == 'all')
      this.setState()
  };

  onDelete_zz = key => {
    console.log(key);
  };

  onChangeTable_zz = sorter => {
    console.log('params', sorter);
  };



  render() {
    return (
      <div className={st.doorplatesearch}>
        <Navs />
        <div className={st.body}>
          <Panel defaultSelectedKeys={["1"]}/>
          <div className={st.content}>
            <div className={st.tab}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="住宅门牌" key="1">
                  <div className={st.condition}>
                    <Cascader
                      options={this.state.DistricData_zz}
                      onChange={(e) => { this.setState({ DistrictID_zz: e[e.length - 1] }) }}
                      changeOnSelect
                      expandTrigger="hover"
                      placeholder={'行政区划'}
                      style={{ width: 300 }}
                    />
                    <Input placeholder="小区名称/道路名称" style={{ width: 200 }} onChange={(e) => { this.setState({ inputValue_zz: e.target.value }) }} />
                    <Button type="primary" icon="search" onClick={() => { this.setState({ currentPageNum: 1 }, () => { this.SearchResidenceMP(this.pageSize, 1) }) }}>
                      搜索
                    </Button>
                  </div>
                  <div className={st.table}>
                    <Table
                      columns={this.columns_zz}
                      dataSource={this.state.tableData_zz}
                      onChange={sorter => this.onChangeTable_zz(sorter)}
                      pagination={false}
                    />
                    <Pagination onChange={(page, pageSize) => { this.setState({ currentPageNum: page }, () => { this.SearchResidenceMP(pageSize, page) }) }}
                      current={this.state.currentPageNum}
                      total={this.state.totalCount_zz}
                      pageSize={this.pageSize}
                      showQuickJumper={true}
                      showTotal={(total, range) => `共${total}条`}
                      style={{ float: 'right', margin: 20 }} />
                  </div>
                  {
                    this.state.visibleMap_zz ? (<Modal
                      visible={true}
                      title="地图定位查看"
                      onCancel={() => this.setState({ visibleMap_zz: false })}
                    >
                      <Map pointPosition={this.state.detailsData_zz} MPType={"ZZ"} MPState={"watch"} />
                    </Modal>) : null
                  }
                  {
                    this.state.visibleEdit_zz ? (<Modal
                      title="门牌维护"
                      visible={true}
                      onCancel={() => this.setState({ visibleEdit_zz: false })}
                    >
                      <WrappedEditZZForm content={this.state.detailsData_zz} DistricData={this.state.DistricData_zz} />
                    </Modal>) : null
                  }
                </TabPane>
                <TabPane tab="道路门牌" key="2">
                  Content of Tab Pane 2
                  <Select
                    style={{ width: 120 }}
                    onChange={e => this.selectChange_zz(e)}
                    placeholder="门牌类"
                  >
                    <Option value="all">全部</Option>
                    <Option value="1">单号</Option>
                    <Option value="2">双号</Option>
                  </Select>
                </TabPane>
                <TabPane tab="农村门牌" key="3">
                  Content of Tab Pane 3
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default DoorplateSearch;
