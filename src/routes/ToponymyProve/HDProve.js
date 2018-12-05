import React, { Component } from 'react';
import {
  notification,
  Popover,
  Cascader,
  Input,
  Button,
  Table,
  Pagination,
  Icon,
  Modal,
  Popconfirm,
} from 'antd';
import st from './HDProve.less';
import HDForm from '../Doorplate/Forms/HDForm.js';
import ProveForm from './ProveForm.js';
import MPZForm from './MPZForm.js';

import {
  url_GetDistrictTreeFromDistrict,
  url_SearchResidenceMP,
  url_CancelResidenceMP,
} from '../../common/urls.js';
import { Post } from '../../utils/request.js';
import { getDistricts } from '../../utils/utils.js';

class HDProve extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.privilege === 'edit';
  }

  columns = [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '标准地址', dataIndex: 'StandardAddress', key: 'StandardAddress' },
    { title: '房产证地址', dataIndex: 'FCZAddress', key: 'FCZAddress' },
    { title: '土地证地址', dataIndex: 'TDZAddress', key: 'TDZAddress' },
    { title: '户籍地址', dataIndex: 'HJAddress', key: 'HJAddress' },
    { title: '其它地址', dataIndex: 'OtherAddress', key: 'OtherAddress' },
    {
      title: '操作',
      key: 'operation',
      width: 100,
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
            {this.getEditComponent(
              <Popover
                placement="left"
                content={
                  <div>
                    <Button type="primary" onClick={e => this.onPrint1(i)}>
                      门牌证
                    </Button>&ensp;
                    <Button type="primary" onClick={e => this.onPrint2(i)}>
                      地名证明
                    </Button>
                  </div>
                }
              >
                <Icon type="printer" title="打印" />
              </Popover>
            )}{' '}
            {this.getEditComponent(
              <Popconfirm
                placement="left"
                title="确定注销该门牌？"
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                onConfirm={e => this.onDelete(i)}
              >
                <Icon type="delete" title="删除" />
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  state = {
    showMPZForm: false,
    showEditForm: false,
    showProveForm: false,
    total: 0,
    pageSize: 25,
    pageNum: 1,
    rows: [],
    districts: [],
    loading: false,
  };

  condition = {
    pageSize: 25,
    pageNum: 1,
  };
  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }
  closeEditForm() {
    this.setState({ showEditForm: false });
  }

  closeProveForm() {
    this.setState({ showProveForm: false });
  }

  closeMPZForm() {
    this.setState({ showMPZForm: false });
  }

  onEdit(e) {
    this.setState({ formId: e ? e.ID : null, showEditForm: true });
  }

  onPrint1(e) {
    this.setState({ formId: e ? e.ID : null, showMPZForm: true });
  }

  onPrint2(e) {
    this.setState({ formId: e ? e.ID : null, showProveForm: true });
  }

  async onDelete(e) {
    await Post(url_CancelResidenceMP, { ID: [e.ID] }, e => {
      notification.success({ description: '注销成功！', message: '成功' });
      this.search(this.condition);
    });
  }

  onShowSizeChange(pn, ps) {
    let obj = {};
    if (pn) obj.pageNum = pn;
    if (ps) obj.pageSize = ps;
    this.setState(obj);
    let newCondition = {
      ...this.condition,
      ...obj,
    };

    this.search(newCondition);
  }

  async search(condition) {
    this.setState({ loading: true });
    await Post(url_SearchResidenceMP, condition, e => {
      console.log(e);
      this.condition = condition;
      let { pageNum, pageSize } = this.state;
      let rows = e.Data;
      if (rows && rows.length) {
        rows = rows.map((e, i) => {
          e.index = (pageNum - 1) * pageSize + 1 + i;
          return e;
        });
      }
      this.setState({
        total: e.Count,
        rows: rows,
      });
    });
    this.setState({ loading: false });
  }

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  componentDidMount() {
    this.getDistricts();
  }

  render() {
    let {
      formId,
      districts,
      showMPZForm,
      showEditForm,
      showProveForm,
      rows,
      pageNum,
      pageSize,
      total,
      loading,
    } = this.state;
    const { edit } = this;
    return (
      <div className={st.HDProve}>
        <div className={st.header}>
          <Cascader
            allowClear
            expandTrigger="hover"
            options={districts}
            placeholder="行政区"
            onChange={(a, b) => {
              let jd = a && a[1];
              this.condition.DistrictID = jd;
            }}
          />
          &ensp;
          <Input
            onChange={e => {
              let v = e.target.value;
              this.condition.PropertyOwner = v;
            }}
            placeholder="产权人"
            style={{ width: '200px', marginLeft: '10px' }}
          />
          &ensp;
          <Input
            onChange={e => {
              let v = e.target.value;
              this.condition.StandardAddress = v;
            }}
            placeholder="标准地址"
            style={{ width: '200px', marginLeft: '10px' }}
          />
          &ensp;
          <Button
            style={{ marginLeft: '10px' }}
            icon="search"
            type="primary"
            onClick={e => this.onShowSizeChange(1, null)}
          >
            查询
          </Button>
          &ensp;
          {this.getEditComponent(
            <Button
              type="primary"
              style={{ marginLeft: '10px' }}
              icon="file-text"
              onClick={e => this.onEdit()}
            >
              新增门牌
            </Button>
          )}
        </div>
        <div className={st.body}>
          <Table
            loading={loading}
            bordered
            dataSource={rows}
            columns={this.columns}
            pagination={false}
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
            pageSizeOptions={[15, 50, 100, 200]}
            onChange={this.onShowSizeChange.bind(this)}
            showTotal={(total, range) =>
              total ? `共：${total} 条，当前：${range[0]}-${range[1]} 条` : ''
            }
          />
        </div>
        <Modal
          wrapClassName="fullmodal"
          visible={showEditForm}
          destroyOnClose={true}
          onCancel={this.closeEditForm.bind(this)}
          title={formId ? '门牌维护' : '新增门牌'}
          footer={null}
        >
          <HDForm
            privilege={this.props.privilege}
            id={formId}
            onCancel={this.closeEditForm.bind(this)}
            onSaveSuccess={e => this.onShowSizeChange()}
          />
        </Modal>
        <Modal
          visible={showProveForm}
          bodyStyle={{ padding: '10px 20px 0' }}
          destroyOnClose={true}
          onCancel={this.closeProveForm.bind(this)}
          title="开具地名证明"
          footer={null}
          width={800}
        >
          <ProveForm
            id={formId}
            type="ResidenceMP"
            onCancel={this.closeProveForm.bind(this)}
            onOKClick={this.closeProveForm.bind(this)}
          />
        </Modal>
        <Modal
          visible={showMPZForm}
          bodyStyle={{ padding: '10px 20px 0' }}
          destroyOnClose={true}
          onCancel={this.closeMPZForm.bind(this)}
          title="打印门牌证"
          footer={null}
          width={800}
        >
          <MPZForm
            id={formId}
            type="ResidenceMP"
            onCancel={this.closeMPZForm.bind(this)}
            onOKClick={this.closeMPZForm.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

export default HDProve;
