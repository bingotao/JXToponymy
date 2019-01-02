import React, { Component } from 'react';
import st from './RPBZ.less';
import { GetRPBZColumns } from '../DicManageColumns';
import { Table, Icon, Button, Form, Modal, Input, Select, notification } from 'antd';
const FormItem = Form.Item;
import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import {
  url_GetRPBZFromDic,
  url_GetRPBZFromDicByID,
  url_GetRPCategory,
  url_ModifyRPBZ,
  url_DeleteRPBZ,
} from '../../../common/urls.js';

class RPBZ extends Component {
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
  };
  showLoading() {
    this.setState({ showLoading: true });
  }
  hideLoading() {
    this.setState({ showLoading: false });
  }
  componentDidMount() {
    this.getRPBZ();
    this.getRPCategory();
  }
  async getRPBZ() {
    this.showLoading();
    let rt = await Post(url_GetRPBZFromDic);
    rtHandle(rt, d => {
      let rpbz = d.map((e, i) => {
        e.key = e.IndetityID;
        return e;
      });
      this.setState({ RPBZData: rpbz });
      this.hideLoading();
    });
  }
  async getRPCategory() {
    let rt = await Post(url_GetRPCategory);
    rtHandle(rt, d => {
      this.setState({ rpCategory: d });
    });
  }
  addRPBZ() {
    this.setState({ showModal: true, modalTitle: '门牌标志新增', modify: false });
  }
  closeModal() {
    this.setState({ showModal: false, modalTitle: '', modify: false, entity: {} });
  }
  validate(errs, bAdrress) {
    errs = errs || [];
    let { entity } = this.state;
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
  async onEdit(i) {
    let rt = await Post(url_GetRPBZFromDicByID, { id: i.IndetityID });
    rtHandle(rt, d => {
      this.setState({ showModal: true, entity: d, modalTitle: '路牌标志修改', modify: true });
    });
  }

  onDel(i) {
    Modal.confirm({
      title: '提醒',
      content: '确定删除所选路牌标志？',
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
    let { showLoading, RPBZData, showModal, modalTitle, modify, entity, rpCategory } = this.state;
    return (
      <div className={st.RPBZ}>
        <div className={st.header}>
          <div>路牌编制字典管理</div>
          <div>
            <Button type="primary" icon="plus-circle" onClick={e => this.addRPBZ()}>
              新增路牌标志
            </Button>
          </div>
        </div>
        <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <Table
            bordered={true}
            pagination={false}
            columns={this.columns}
            dataSource={RPBZData}
            loading={showLoading}
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
            <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="路牌及维修相关类型">
              {getFieldDecorator('Category', {
                rules: [
                  {
                    required: true,
                    message: '路牌及维修相关类型不能为空',
                  },
                ],
                initialValue: entity.Category,
              })(
                <Select
                  allowClear
                  placeholder="路牌及维修相关类型"
                  onChange={e => this.changeRPCategory(e)}
                  disabled={modify}
                >
                  {rpCategory.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                </Select>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="路牌及维修相关数据">
              {getFieldDecorator('Data', {
                rules: [
                  {
                    required: true,
                    message: '路牌及维修相关数据不能为空',
                  },
                ],
                initialValue: entity.Data,
              })(
                <Input
                  onChange={e => this.changeRPData(e.target.value)}
                  placeholder="路牌及维修相关数据"
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

RPBZ = Form.create()(RPBZ);
export default RPBZ;
