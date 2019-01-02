import React, { Component } from 'react';
import st from './MPBZ.less';
import { GetMPBZColumns } from '../DicManageColumns';
import { Table, Icon, Button, Form, Modal, Input, Select, notification } from 'antd';
const FormItem = Form.Item;
import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import {
  url_GetDMBZFromDic,
  url_GetDMBZFromDicByID,
  url_GetMPType,
  url_ModifyDMBZ,
  url_DeleteDMBZ,
} from '../../../common/urls.js';

class MPBZ extends Component {
  constructor(ps) {
    super(ps);
    this.columns = GetMPBZColumns();
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
    MPBZData: null,
    showModal: false,
    modalTitle: '',
    modify: false,
    entity: {},
    mpType: [],
  };
  showLoading() {
    this.setState({ showLoading: true });
  }
  hideLoading() {
    this.setState({ showLoading: false });
  }
  componentDidMount() {
    this.getMPBZ();
    this.getMPType();
  }
  async getMPBZ() {
    this.showLoading();
    let rt = await Post(url_GetDMBZFromDic);
    rtHandle(rt, d => {
      let mpbz = d.map((e, i) => {
        e.key = e.IndetityID;
        return e;
      });
      this.setState({ MPBZData: mpbz });
      this.hideLoading();
    });
  }
  async getMPType() {
    let rt = await Post(url_GetMPType);
    rtHandle(rt, d => {
      this.setState({ mpType: d });
    });
  }
  addMPBZ() {
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
  saveMPBZClick = e => {
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
    await Post(url_ModifyDMBZ, { oldDataJson: JSON.stringify(obj) }, e => {
      notification.success({ description: '保存成功！', message: '成功' });
      this.setState({ showModal: false, entity: {}, modify: false, modalTitle: '' });
      this.getMPBZ();
    });
  }

  changeMPType(e) {
    let { entity } = this.state;
    entity.Type = e;
    this.setState({ entity: entity });
  }
  changeMPSize(e) {
    let { entity } = this.state;
    entity.Size = e;
    this.setState({ entity: entity });
  }
  changeMPMaterial(e) {
    let { entity } = this.state;
    entity.Material = e;
    this.setState({ entity: entity });
  }
  async onEdit(i) {
    let rt = await Post(url_GetDMBZFromDicByID, { id: i.IndetityID });
    rtHandle(rt, d => {
      this.setState({ showModal: true, entity: d, modalTitle: '门牌标志修改', modify: true });
    });
  }

  onDel(i) {
    Modal.confirm({
      title: '提醒',
      content: '确定删除所选门牌标志？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await Post(url_DeleteDMBZ, { dmbz: i }, e => {
          notification.success({ description: '删除成功！', message: '成功' });
          this.getMPBZ();
        });
      },
      onCancel() {},
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let { MPBZData, showLoading, showModal, modalTitle, modify, mpType, entity } = this.state;
    return (
      <div className={st.MPBZ}>
        <div className={st.header}>
          <div>门牌编制字典管理</div>
          <div>
            <Button type="primary" icon="copy" onClick={e => this.addMPBZ()}>
              新增门牌标志
            </Button>
          </div>
        </div>
        <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <Table
            bordered={true}
            pagination={false}
            columns={this.columns}
            dataSource={MPBZData}
            loading={showLoading}
          />
        </div>
        <Modal
          wrapClassName={st.mpbzModal}
          visible={showModal}
          destroyOnClose={true}
          onCancel={e => this.closeModal()}
          onOk={this.saveMPBZClick.bind(this)}
          title={modalTitle}
          okText="保存"
          cancelText="取消"
        >
          <Form>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="门牌类型">
              {getFieldDecorator('Type', {
                rules: [
                  {
                    required: true,
                    message: '门牌类型不能为空',
                  },
                ],
                initialValue: entity.Type,
              })(
                <Select
                  allowClear
                  placeholder="门牌类型"
                  onChange={e => this.changeMPType(e)}
                  disabled={modify}
                >
                  {mpType.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                </Select>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="门牌规格">
              {getFieldDecorator('Size', {
                rules: [
                  {
                    required: true,
                    message: '门牌规格不能为空',
                  },
                ],
                initialValue: entity.Size,
              })(
                <Input onChange={e => this.changeMPSize(e.target.value)} placeholder="门牌规格" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} label="门牌材质">
              {getFieldDecorator('Material', {
                initialValue: entity.Material,
              })(
                <Input
                  onChange={e => this.changeMPMaterial(e.target.value)}
                  placeholder="门牌材质"
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

MPBZ = Form.create()(MPBZ);
export default MPBZ;
