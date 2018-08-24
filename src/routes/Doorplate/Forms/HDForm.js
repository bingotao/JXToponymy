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
} from 'antd';
import { mpgg, zjlx } from '../../../common/enums.js';
import st from './HDForm.less';

const FormItem = Form.Item;

class HDForm extends Component {
  state = {
    
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    

    return (
      <div className={st.HDForm}>
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="门牌规格">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(
                        <Select placeholder="门牌规格">
                          {mpgg.map(d => <Select.Option key={d}>{d}</Select.Option>)}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Divider />

                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="小区名称">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Input placeholder="小区名称" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="幢号">
                      {getFieldDecorator('Field1')(<Input addonAfter="幢" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="单元号">
                      {getFieldDecorator('Field1')(<Input addonAfter="单元" />)}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="道路名">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Input placeholder="道路名" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="门牌号">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Input placeholder="门牌号" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="宿舍名称">
                      {getFieldDecorator('Field1')(<Input placeholder="宿舍名称" />)}
                    </FormItem>
                  </Col>
                </Row>

                <Divider />
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户室号">
                      {getFieldDecorator('Field1', {
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(<Input placeholder="户室号" addonAfter="室" />)}
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="经度">
                      {getFieldDecorator('Field1')(<Input type="number" placeholder="经度" />)}
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="纬度">
                      {getFieldDecorator('Field1')(<Input type="number" placeholder="纬度" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="房产证地址">
                      {getFieldDecorator('Field1')(<Input placeholder="房产证地址" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="房产证号">
                      {getFieldDecorator('Field1')(<Input placeholder="房产证号" />)}
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="不动产证地址">
                      {getFieldDecorator('Field1')(<Input placeholder="不动产证地址" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="不动产证号">
                      {getFieldDecorator('Field1')(<Input placeholder="不动产证号" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户籍号">
                      {getFieldDecorator('Field1')(<Input placeholder="户籍号" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户籍地址">
                      {getFieldDecorator('Field1')(<Input placeholder="户籍地址" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="其它地址">
                      {getFieldDecorator('Field1')(<Input placeholder="其它地址" />)}
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
                    <FormItem label="房产证文件">
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
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem label="不动产证文件">
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
                    <FormItem label="户籍文件">
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

HDForm = Form.create()(HDForm);
export default HDForm;
