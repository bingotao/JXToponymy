/*
自然村类必填项：行政区划、自然村名称、门牌号、门牌规格
门牌号、户室号只能是数字
标准地址：嘉兴市/市辖区/镇街道/村社区/自然村名称/门牌号/户室号
*/
import React, { Component } from 'react';
import {
  Form,
  Row,
  Col,
  Input,
  Button,
  Radio,
  Divider,
  DatePicker,
  Icon,
  Cascader,
  Select,
  Upload,
  Tooltip,
  Checkbox,
} from 'antd';
import { mpgg, zjlx } from '../../../common/enums.js';
import st from './VGForm.less';

const FormItem = Form.Item;

class VGForm extends Component {
  state = {
    mplx: 'xq',
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    let { mplx } = this.state;

    return (
      <div className={st.VGForm}>
        <div className={st.body}>
          <Form>
            <div className={st.group}>
              <div className={st.grouptitle}>
                基本信息<span>说明：“ * ”号标识的为必填项</span>
              </div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="行政区划">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Cascader placeholder="行政区划" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮政编码">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Input placeholder="邮政编码" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="自然村名称">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Input placeholder="自然村名称" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="门牌号码">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Input placeholder="门牌号码" />)}
                    </FormItem>
                  </Col>
                  <Col span={3}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="经度">
                      {getFieldDecorator('Field1')(<Input type="number" placeholder="经度" />)}
                    </FormItem>
                  </Col>
                  <Col span={3}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="纬度">
                      {getFieldDecorator('Field1')(<Input type="number" placeholder="纬度" />)}
                    </FormItem>
                  </Col>
                  <Col span={2}>
                    <FormItem>
                      <Tooltip placement="right" title="定位">
                        <Button
                          style={{ marginLeft: '20px' }}
                          type="primary"
                          shape="circle"
                          icon="environment"
                          size="small"
                        />
                      </Tooltip>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="原门牌号码">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Input placeholder="原门牌号码" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="门牌规格">
                      {getFieldDecorator('Field1')(
                        <Select placeholder="门牌规格">
                          {mpgg.map(i => <Select.Option key={i}>{i}</Select.Option>)}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户室号">
                      {getFieldDecorator('Field1')(<Input placeholder="户室号" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={16}>
                    <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="标准地址">
                      {getFieldDecorator('Field1')(<Input disabled={true} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="申办人">
                      {getFieldDecorator('申办人')(<Input placeholder="申办人" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="联系电话">
                      {getFieldDecorator('Field1')(<Input placeholder="联系电话" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="编制日期">
                      {getFieldDecorator('Field2', { initialValue: moment() })(<DatePicker />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={4}>
                    <FormItem style={{ textAlign: 'right' }}>
                      {getFieldDecorator('zzmp', { valuePropName: 'checked', initialValue: true })(
                        <Checkbox>制作门牌</Checkbox>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem style={{ textAlign: 'right' }}>
                      {getFieldDecorator('yjmp', { valuePropName: 'checked', initialValue: true })(
                        <Checkbox>邮寄门牌</Checkbox>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮寄地址">
                      {getFieldDecorator('邮寄地址')(<Input placeholder="邮寄地址" />)}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={st.group}>
              <div className={st.grouptitle}>产证信息</div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="产权人">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Input placeholder="产权人" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="证件类型">
                      {getFieldDecorator('Field1')(
                        <Select placeholder="证件类型">
                          {zjlx.map(d => <Select.Option key={d}>{d}</Select.Option>)}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="证件号码">
                      {getFieldDecorator('Field1')(<Input placeholder="证件号码" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="土地证地址">
                      {getFieldDecorator('Field1')(<Input placeholder="土地证地址" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="土地证号">
                      {getFieldDecorator('Field1')(<Input placeholder="土地证号" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="确权证地址">
                      {getFieldDecorator('Field1')(<Input placeholder="确权证地址" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="确权证证号">
                      {getFieldDecorator('Field1')(<Input placeholder="确权证证号" />)}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={st.group}>
              <div className={st.grouptitle}>附件上传</div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={12}>
                    <FormItem label="土地证文件">
                      <Upload
                        listType="picture-card"
                        fileList={[]}
                        action="//jsonplaceholder.typicode.com/posts/"
                      >
                        <div>
                          <Icon type="plus" />
                          <div className="ant-upload-text">添加文件</div>
                        </div>
                      </Upload>
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="确权证文件">
                      <Upload
                        listType="picture-card"
                        fileList={[]}
                        action="//jsonplaceholder.typicode.com/posts/"
                      >
                        <div>
                          <Icon type="plus" />
                          <div className="ant-upload-text">添加文件</div>
                        </div>
                      </Upload>
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
        </div>
        <div className={st.footer}>
          <div style={{ float: 'left' }}>
            <Button type="primary">打印门牌证</Button>
            &emsp;
            <Button type="primary">开具地名证明</Button>
          </div>
          <div style={{ float: 'right' }}>
            <Button type="primary">保存</Button>
            &emsp;
            <Button type="default">取消</Button>
          </div>
        </div>
      </div>
    );
  }
}

VGForm = Form.create()(VGForm);
export default VGForm;
