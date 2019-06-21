import React, { Component } from 'react';
import st from './WXLX.less';
import { GetRPBZColumns } from '../DicManageColumns';
import { Table, Icon, Button, Form, Modal, Input, Select, notification, Cascader } from 'antd';
const FormItem = Form.Item;
import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import { getDistrictsWithJX } from '../../../utils/utils.js';
import {
  url_GetRPBZFromDic,
  url_GetRPBZFromDicByID,
  url_GetRPCategory,
  url_ModifyRPBZ,
  url_DeleteRPBZ,
  url_GetDistrictTree,
} from '../../../common/urls.js';

class WXLX extends Component {
  queryCondition = {};

  constructor(ps) {
    super(ps);
    this.columns = GetRPBZColumns();
    this.columns.push({
      title: '操作',
      key: 'operation',
      width: 100,
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
    showLoading: false,
    RPBZData: null,
    showModal: false,
    modalTitle: '',
    modify: false,
    entity: {},
    rpCategory: [],
    areas: [],
  };
  showLoading() {
    this.setState({ showLoading: true });
  }
  hideLoading() {
    this.setState({ showLoading: false });
  }

  async componentDidMount() {
    let rt = await Post(url_GetDistrictTree);
    rtHandle(rt, d => {
      let areas = getDistrictsWithJX(d);
      this.setState({ areas: areas });
    });
    //this.search(this.queryCondition);

    this.getRPBZ(this.queryCondition);
    this.getRPCategory();
  }
  async getRPBZ(queryCondition) {
    this.showLoading();
    let rt = await Post(url_GetRPBZFromDic, queryCondition);

    rtHandle(rt, d => {
      d = d.filter(t => t.LX == '维修类型');
      let rpbz = d.map((e, i) => {
        e.key = e.IndetityID;
        return e;
        // if (e && e.LX && e.LX == '路牌类型') {

        // }
      });
      this.setState({ RPBZData: rpbz });
      this.hideLoading();
    });
  }
  async getRPCategory() {
    let rt = await Post(url_GetRPCategory);
    rtHandle(rt, d => {
      d = d.filter(t => t.LX == '维修类型');
      let rpCategory = d.map((e, i) => {
        return e.Category;
      });
      this.setState({ rpCategory: rpCategory[0] });
    });
  }
  addRPBZ() {
    this.setState({ showModal: true, modalTitle: '维修类型新增', modify: false });
  }
  closeModal() {
    this.setState({ showModal: false, modalTitle: '', modify: false, entity: {} });
  }
  validate(errs, bAdrress) {
    errs = errs || [];
    let { entity } = this.state;
    if (entity.LX === undefined || entity.LX == null) entity.LX = '维修类型';
    let saveObj = entity;
    return { errs, saveObj };
  }
  saveRPBZClick = e => {
    e.preventDefault();
    this.props.form.validateFields(
      async function(err, values) {
        let errors = [];
        let { entity } = this.state;
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
    await Post(url_ModifyRPBZ, { oldDataJson: JSON.stringify(obj) }, e => {
      notification.success({ description: '保存成功！', message: '成功' });
      this.setState({ showModal: false, entity: {}, modify: false, modalTitle: '' });
      this.getRPBZ();
    });
  }

  changeRPCategory(e) {
    let { entity } = this.state;
    entity.Category = e;
    this.setState({ entity: entity });
  }
  changeRPData(e) {
    let { entity } = this.state;
    entity.Data = e;
    this.setState({ entity: entity });
  }
  changeDistrict(e) {
    let { entity } = this.state;
    entity.NeighborhoodsID = e[e.length - 1];
    this.setState({ entity: entity });
  }

  async onEdit(i) {
    let rt = await Post(url_GetRPBZFromDicByID, { id: i.IndetityID });
    rtHandle(rt, d => {
      if (d.NeighborhoodsID) {
        let x = d.NeighborhoodsID.split('.');
        for (let i = 1, j = x.length; i < j; i++) {
          x[i] = [x[i - 1], x[i]].join('.');
        }
        d.DistrictID = x;
      } else {
        d.DistrictID = [];
      }
      this.setState({ showModal: true, entity: d, modalTitle: '维修类型修改', modify: true });
    });
  }

  onDel(i) {
    Modal.confirm({
      title: '提醒',
      content: '确定删除所选维修类型？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await Post(url_DeleteRPBZ, { rpbz: i }, e => {
          notification.success({ description: '删除成功！', message: '成功' });
          this.getRPBZ();
        });
      },
      onCancel() {},
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let {
      showLoading,
      RPBZData,
      showModal,
      modalTitle,
      modify,
      entity,
      rpCategory,
      areas,
    } = this.state;
    return (
      <div className={st.WXLX}>
        <div className={st.header}>
          <Cascader
            changeOnSelect={true}
            options={areas}
            onChange={e => {
              this.queryCondition.DistrictID = e[e.length - 1];
            }}
            placeholder="请选择行政区"
            style={{ width: '200px' }}
            expandTrigger="hover"
          />
          <Button icon="search" onClick={e => this.getRPBZ(this.queryCondition)}>
            查询
          </Button>
          <Button type="primary" icon="plus-circle" onClick={e => this.addRPBZ()}>
            新增
          </Button>
        </div>
        <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <Table
            bordered={true}
            pagination={false}
            columns={this.columns}
            dataSource={RPBZData}
            loading={showLoading}
            rowClassName={(record, index) => {
              let className = 'light-row';
              if (index % 2 === 1) className = 'dark-row';
              return className;
            }}
          />
        </div>
        <Modal
          wrapClassName={st.rpbzModal}
          visible={showModal}
          destroyOnClose={true}
          onCancel={e => this.closeModal()}
          onOk={this.saveRPBZClick.bind(this)}
          title={modalTitle}
          okText="保存"
          cancelText="取消"
        >
          <Form>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="行政区划">
              {getFieldDecorator('NeighborhoodsID', {
                rules: [
                  {
                    required: true,
                    message: '行政区划不能为空',
                  },
                ],
                initialValue: entity.DistrictID,
              })(
                <Cascader
                  changeOnSelect={true}
                  options={areas}
                  onChange={e => {
                    this.changeDistrict(e);
                  }}
                  placeholder="请选择行政区"
                  style={{ width: '100%' }}
                  expandTrigger="hover"
                />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="类型">
              {getFieldDecorator('Category', {
                rules: [
                  {
                    required: true,
                    message: '类型不能为空',
                  },
                ],
                initialValue: entity.Category,
              })(
                <Select
                  allowClear
                  placeholder="类型"
                  onChange={e => this.changeRPCategory(e)}
                  disabled={modify}
                >
                  {rpCategory.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                </Select>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="内容">
              {getFieldDecorator('Data', {
                rules: [
                  {
                    required: true,
                    message: '内容不能为空',
                  },
                ],
                initialValue: entity.Data,
              })(<Input onChange={e => this.changeRPData(e.target.value)} placeholder="内容" />)}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

WXLX = Form.create()(WXLX);
export default WXLX;
