import React, { Component } from 'react';
import st from './District.less';
import { Spin, Table, Icon, Button, Form, Modal, Input, Select, notification } from 'antd';
import { DataGrid, GridColumn } from 'rc-easyui';
const FormItem = Form.Item;
import {
  url_SearchDist,
  url_SearchDistByID,
  url_ModifyDist,
  url_GetCountys,
  url_DeleteDist,
} from '../../../common/urls.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import { GetDistrictColumns } from '../DicManageColumns';

class District extends Component {
  constructor(ps) {
    super(ps);
    this.columns = GetDistrictColumns();
    this.columns.push({
      title: '操作',
      key: 'operation',
      width: '100px',
      align: 'center',
      render: i => {
        return (
          <div className={st.rowbtns}>
            <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
            <Icon type="delete" title="删除" onClick={e => this.onDel(i)} />
          </div>
        );
      },
    });
  }
  state = {
    districts: [],
    showLoading: false,
    showModal: false,
    ModalTitle: '',
    entity: {},
    newForm: true,
    Countys: [],
    addState: '',
  };
  // 存储修改后的数据
  mObj = {};

  componentDidMount() {
    this.getDistricts();
    this.GetCountys();
  }
  async onEdit(i) {
    let rt = await Post(url_SearchDistByID, { id: i.ID });
    rtHandle(rt, d => {
      let state = null;
      if (d.CountyName !== null && d.NeighborhoodsName !== null) state = 'Neighbour';
      else state = 'County';
      this.setState({ showModal: true, entity: d, ModalTitle: '行政区划修改', addState: state });
    });
  }
  addCounty() {
    this.setState({ showModal: true, ModalTitle: '区（县）新增', addState: 'County' });
  }
  addNeighbour() {
    this.setState({ showModal: true, ModalTitle: '镇（街道）新增', addState: 'Neighbour' });
  }
  showLoading() {
    this.setState({ showLoading: true });
  }
  hideLoading() {
    this.setState({ showLoading: false });
  }

  async GetCountys() {
    let rt = await Post(url_GetCountys);
    rtHandle(rt, d => {
      this.setState({ Countys: d });
    });
  }
  onDel(i) {
    Modal.confirm({
      title: '提醒',
      content: '确定删除所选行政区划？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await Post(url_DeleteDist, { dis: i }, e => {
          notification.success({ description: '删除成功！', message: '成功' });
          this.getDistricts();
          this.GetCountys();
        });
      },
      onCancel() {},
    });
  }
  closeModal() {
    this.setState({ showModal: false, entity: {}, addState: '' });
    this.mObj = {};
  }
  validate(errs, bAdrress) {
    errs = errs || [];
    let { entity } = this.state;
    let saveObj = {
      ID: entity.ID,
      ...this.mObj,
    };

    let validateObj = {
      ...entity,
      ...saveObj,
    };
    return { errs, saveObj, validateObj };
  }
  saveDistClick = e => {
    e.preventDefault();
    this.props.form.validateFields(
      async function(err, values) {
        let errors = [];
        // form 的验证错误
        if (err) {
          for (let i in err) {
            let j = err[i];
            if (j.errors) {
              errors = errors.concat(j.errors.map(item => item.message));
            }
          }
        }

        let { errs, saveObj } = this.validate(errors);
        if (errs.length) {
          Modal.error({
            title: '错误',
            okText: '知道了',
            content: errs.map((e, i) => (
              <div>
                {i + 1}、{e}；
              </div>
            )),
          });
        } else {
          this.save(saveObj);
        }
      }.bind(this)
    );
  };
  async save(obj) {
    await Post(url_ModifyDist, { oldDataJson: JSON.stringify(obj) }, e => {
      notification.success({ description: '保存成功！', message: '成功' });
      this.mObj = {};
      this.setState({ showModal: false, entity: {}, addState: '', ModalTitle: '' });
      this.getDistricts();
      this.GetCountys();
    });
  }

  async getDistricts() {
    this.showLoading();
    let rt = await Post(url_SearchDist);
    rtHandle(rt, d => {
      let districts = d.map((e, i) => {
        e.key = e.ID;
        e.idx = i + 1;
        return e;
      });
      this.setState({ districts: districts });
      this.hideLoading();
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let { districts, showLoading, showModal, ModalTitle, entity, Countys, addState } = this.state;

    return (
      <div className={st.District}>
        <div className={st.header}>
          <div>行政区字典管理</div>
          <div>
            <Button type="primary" icon="plus" onClick={e => this.addCounty()}>
              新增区（县）
            </Button>
            &emsp;
            <Button type="primary" icon="plus" onClick={e => this.addNeighbour()}>
              新增乡镇（街道）
            </Button>
          </div>
        </div>
        <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
          {/* <Table
            bordered={true}
            pagination={false}
            columns={this.columns}
            dataSource={districts}
            loading={showLoading}
          /> */}
          <DataGrid data={districts} style={{ height: '100%', width: '100%' }}>
            <GridColumn field="idx" title="序号" align="center" width={80} />
            <GridColumn field="CountyName" title="行政区" align="center" />
            <GridColumn field="NeighborhoodsName" title="镇街道" align="center" />
            <GridColumn field="Code" title="乡镇代码" align="center" />
            <GridColumn
              field="action"
              title="操作"
              align="center"
              width={80}
              render={({ row }) => {
                return (
                  <div className={st.rowbtns}>
                    <Icon type="edit" title="编辑" onClick={e => this.onEdit(row)} />
                    <Icon type="delete" title="删除" onClick={e => this.onDel(row)} />
                  </div>
                );
              }}
            />
          </DataGrid>
        </div>
        <Modal
          wrapClassName={st.modifyModal}
          visible={showModal}
          destroyOnClose={true}
          onCancel={e => this.closeModal()}
          onOk={this.saveDistClick.bind(this)}
          title={ModalTitle}
          okText="保存"
          cancelText="取消"
        >
          <Form>
            {addState === 'County' ? (
              <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="区（县）">
                {getFieldDecorator('CountyName', {
                  rules: [
                    {
                      required: true,
                      message: '请填写区（县）名称!',
                    },
                  ],
                  initialValue: entity.CountyName,
                })(
                  <Input
                    onChange={e => {
                      this.mObj.CountyName = e.target.value;
                    }}
                    placeholder="区（县）"
                  />
                )}
              </FormItem>
            ) : (
              <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="区（县）">
                {getFieldDecorator('CountyName', {
                  rules: [
                    {
                      required: true,
                      message: '请填写区（县）名称!',
                    },
                  ],
                  initialValue: entity.CountyName,
                })(
                  <Select
                    allowClear
                    onChange={e => {
                      this.mObj.CountyName = e;
                    }}
                    placeholder="区（县）"
                  >
                    {Countys.map(d => (
                      <Select.Option key={d} value={d}>
                        {d}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            )}
            {addState === 'Neighbour' ? (
              <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="镇（街道）">
                {getFieldDecorator('NeighborhoodsName', {
                  rules: [
                    {
                      required: true,
                      message: '请填写镇（街道）名称!',
                    },
                  ],
                  initialValue: entity.NeighborhoodsName,
                })(
                  <Input
                    onChange={e => {
                      this.mObj.NeighborhoodsName = e.target.value;
                    }}
                    placeholder="镇（街道）"
                  />
                )}
              </FormItem>
            ) : null}
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="乡镇代码">
              {getFieldDecorator('Code', {
                rules: [
                  {
                    required: true,
                    message: '请填写乡镇代码!',
                  },
                ],
                initialValue: entity.Code,
              })(
                <Input
                  onChange={e => {
                    this.mObj.Code = e.target.value;
                  }}
                  placeholder="乡镇代码"
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
District = Form.create()(District);

export default District;
