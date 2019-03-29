import React, { Component } from 'react';
import {
  notification,
  Select,
  Cascader,
  Button,
  DatePicker,
  Table,
  Pagination,
  Icon,
  Modal,
} from 'antd';
import st from './BASearch.less';

import BAForm from '../Forms/BAForm';
import LocateMap from '../../../components/Maps/LocateMap2.js';

import {
  baseUrl,
  url_GetDistrictTreeFromData,
  url_SearchPlaceName,
  url_CancelPlaceName,
} from '../../../common/urls.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import { GetDMTypesFromData, GetConditionOfPlaceName } from '../../../services/ExpressOpinions';
import { getDistricts } from '../../../utils/utils.js';
import { divIcons } from '../../../components/Maps/icons';
import Authorized from '../../../utils/Authorized4';

let dmIcon = divIcons.dm;

class BASearch extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  state = {
    showBAForm: false,
    selectedRowKeys: [],
    total: 0,
    rows: [],
    pageSize: 25,
    pageNum: 1,
    loading: false,
    districts: [],
    DMTypes: [],
  };

  condition = { ZYSSType: '交通设施类' };

  columns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '行政区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
    {
      title: '镇街道',
      align: 'center',
      dataIndex: 'NeighborhoodsName',
      key: 'NeighborhoodsName',
    },
    { title: '村社区', align: 'center', dataIndex: 'CommunityName', key: 'CommunityName' },
    { title: '标准名称', align: 'center', dataIndex: 'Name', key: 'Name' },
    { title: '地名类别', align: 'center', dataIndex: 'DMType', key: 'DMType' },
    { title: '小类类别', align: 'center', dataIndex: 'SmallType', key: 'SmallType' },
    { title: '主管单位', align: 'center', dataIndex: 'ZGDW', key: 'ZGDW' },
    { title: '申请日期', align: 'center', dataIndex: 'ApplicantDate', key: 'ApplicantDate' },
    {
      title: '操作',
      width: 180,
      key: 'operation',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title={this.edit ? '编辑' : '查看'} onClick={e => this.onEdit(i)} />
            <Icon type="environment-o" title="定位" onClick={e => this.onLocate(i)} />
            {this.edit ? (
              <Icon type="rollback" title="注销" onClick={e => this.onCancel(i)} />
            ) : null}
            {this.edit ? (
              <Icon type="printer" title="打印" onClick={e => this.onPrint(i)} />
            ) : null}
          </div>
        );
      },
    },
  ];

  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }

  async getDistricts() {
    let rt = await Post(url_GetDistrictTreeFromData, { type: 7 });
    rtHandle(rt, d => {
      let districts = getDistricts(d);
      this.setState({ districts: districts });
    });
  }

  async onExport() {
    await GetConditionOfPlaceName(this.condition, e => {
      window.open(`${baseUrl}/PlaceName/ExportPlaceName`, '_blank');
    });
  }

  onEdit(i) {
    this.formId = i.ID;
    this.setState({ showBAForm: true });
  }

  onNewDMBA() {
    this.formId = null;
    this.setState({ showBAForm: true });
  }

  onLocate(i) {
    if (i.Lng && i.Lat) {
      this.Lng = i.Lng;
      this.Lat = i.Lat;
      this.showLocateMap();
    } else {
      notification.warn({ description: '该地名牌无位置信息！', message: '警告' });
    }
  }

  async onCancel(e) {
    let cancelList;
    if (e.ID) {
      cancelList = [e.ID];
    }
    if (e.length) {
      cancelList = e;
    }
    if (cancelList) {
      Modal.confirm({
        title: '提醒',
        content: '确定注销所选地名？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          await Post(url_CancelPlaceName, { IDs: cancelList }, e => {
            notification.success({ description: '注销成功！', message: '成功' });
            this.onShowSizeChange();
          });
        },
        onCancel() {},
      });
    } else {
      notification.warn({ description: '请选择需要注销的地名！', message: '警告' });
    }
  }
  async onPrint0(i) {}

  onShowSizeChange(pn, ps) {
    let page = {};
    if (pn) page.pageNum = pn;
    if (ps) page.pageSize = ps;
    this.setState(page, e => this.search(this.condition));
  }

  closeLocateMap() {
    this.setState({ showLocateMap: false });
  }

  showLocateMap() {
    this.setState({ showLocateMap: true });
  }

  async search(condition) {
    let { pageSize, pageNum } = this.state;
    debugger;
    let newCondition = {
      ...condition,
      PageSize: pageSize,
      pageNum: pageNum,
    };
    this.setState({ loading: { size: 'large', tip: '数据获取中...' } });
    let rt = await Post(url_SearchPlaceName, newCondition, data => {
      this.condition = newCondition;
      this.setState({
        selectedRowKeys: [],
        total: data.Count,
        rows: data.Data.map((e, i) => {
          e.key = e.ID;
          e.index = pageSize * (pageNum - 1) + i + 1;
          return e;
        }),
      });
    });
    this.setState({ loading: false });
  }

  async GetDMTypesFromData(jd) {
    await GetDMTypesFromData({ ZYSSType: this.condition.ZYSSType, DistrictID: jd }, d => {
      this.setState({ DMTypes: d });
    });
  }

  //   async getInitData() {
  //     await Post(url_GetRPBZDataFromData, null, e => {
  //       this.setState(e);
  //     });
  //   }

  componentDidMount() {
    this.getDistricts();
    // this.getInitData();
  }

  render() {
    let {
      showBAForm,
      showLocateMap,
      selectedRowKeys,
      rows,
      total,
      pageSize,
      pageNum,
      loading,
      districts,
      DMTypes,
    } = this.state;

    return (
      <div className={st.BASearch}>
        <div className={st.header}>
          <Select
            onChange={e => {
              this.condition.ZYSSType = e;
              this.GetDMTypesFromData(this.condition.DistrictID);
            }}
            placeholder="专业设施类别"
            style={{ width: '150px' }}
            defaultValue="交通设施类"
          >
            <Select.Option value="交通设施类">交通设施类</Select.Option>
            <Select.Option value="水利电力设施类">水利电力设施类</Select.Option>
            <Select.Option value="纪念地旅游地类">纪念地旅游地类</Select.Option>
            <Select.Option value="亭台碑塔">亭台碑塔</Select.Option>
          </Select>
          &ensp;
          <Cascader
            allowClear
            expandTrigger="hover"
            options={districts}
            placeholder="行政区划"
            changeOnSelect={true}
            onChange={(a, b) => {
              let jd = a[a.length - 1];
              this.condition.DistrictID = jd;
              this.GetDMTypesFromData(jd);
            }}
          />
          &ensp;
          <Select
            allowClear
            onChange={e => {
              this.condition.DMType = e;
            }}
            placeholder="地名类别"
            showSearch
            style={{ width: '150px' }}
          >
            {(DMTypes || []).map(e => <Select.Option value={e}>{e}</Select.Option>)}
          </Select>
          &ensp;
          <DatePicker
            onChange={e => {
              this.condition.start = e ? e.format('YYYY-MM-DD') : null;
            }}
            placeholder="申请日期（起）"
            style={{ width: '150px' }}
          />
          &ensp;
          <DatePicker
            onChange={e => {
              this.condition.end = e ? e.format('YYYY-MM-DD') : null;
            }}
            placeholder="申请日期（止）"
            style={{ width: '150px' }}
          />
          &ensp;
          <Button
            icon="search"
            type="primary"
            onClick={e => {
              this.onShowSizeChange(1, null);
            }}
          >
            搜索
          </Button>
          &ensp;
          {this.getEditComponent(
            <Button type="primary" icon="file-text" onClick={e => this.onNewDMBA()}>
              地名备案
            </Button>
          )}{' '}
          &ensp;
          {this.getEditComponent(
            <Button
              disabled={!(rows && rows.length)}
              type="primary"
              icon="export"
              onClick={e => this.onExport()}
            >
              地名导出
            </Button>
          )}
          &ensp;
          {this.getEditComponent(
            <Button
              disabled={!(selectedRowKeys && selectedRowKeys.length)}
              type="primary"
              icon="export"
              onClick={e => this.onCancel(selectedRowKeys)}
            >
              地名销名
            </Button>
          )}
        </div>
        <div className={st.body}>
          <Table
            bordered
            pagination={false}
            columns={this.columns}
            dataSource={rows}
            loading={loading}
            rowSelection={{
              selectedRowKeys: selectedRowKeys,
              onChange: e => {
                this.setState({ selectedRowKeys: e });
              },
            }}
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
          title={this.formId ? '地名编辑' : '地名备案'}
          destroyOnClose={true}
          centered={true}
          visible={showBAForm}
          onCancel={e => this.setState({ showBAForm: false })}
          footer={null}
        >
          <Authorized>
            <BAForm
              id={this.formId}
              onCancelClick={e => this.setState({ showBAForm: false })}
              onSaveSuccess={e => {
                this.onShowSizeChange();
              }}
            />
          </Authorized>
        </Modal>
        <Modal
          wrapClassName={st.wrapmodal}
          visible={showLocateMap}
          destroyOnClose={true}
          onCancel={this.closeLocateMap.bind(this)}
          title="定位"
          footer={null}
        >
          <LocateMap
            onMapReady={lm => {
              let center = [this.Lat, this.Lng];
              L.marker(center, { icon: dmIcon }).addTo(lm.map);
              lm.map.setView(center, 18);
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default BASearch;
