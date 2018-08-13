import React, { Component } from 'react';
import { Button, Row, Col, Icon, Upload, Form, DatePicker, Input } from 'antd';
import st from './GPForm.less';

const FormItem = Form.Item;

class GPForm extends Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={st.GPForm}>
        <div className={st.content}>
          <Form>
            <div className={st.group}>
              <div className={st.grouptitle}>
                基本信息<span>说明：“ * ”号标识的为必填项</span>
              </div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="二维码编号">
                      {getFieldDecorator('Field1')(<Input placeholder="二维码编号" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="区域">
                      {getFieldDecorator('Field1')(<Input placeholder="区域" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="道路名称">
                      {getFieldDecorator('Field1')(<Input placeholder="道路名称" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="设置路口">
                      {getFieldDecorator('Field1')(<Input placeholder="设置路口" />)}
                    </FormItem>
                  </Col>
                  <Col span={1} />
                  <Col span={3}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="经度">
                      {getFieldDecorator('Field1')(<Input placeholder="经度" />)}
                    </FormItem>
                  </Col>
                  <Col span={3}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="维度">
                      {getFieldDecorator('Field1')(<Input placeholder="维度" />)}
                    </FormItem>
                  </Col>
                  <Col span={1}>
                    <FormItem>
                      &emsp;<Button size="small" shape="circle" type="primary" icon="environment" />
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="样式">
                      {getFieldDecorator('Field1')(<Input placeholder="样式" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="材质">
                      {getFieldDecorator('Field1')(<Input placeholder="材质" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="规格">
                      {getFieldDecorator('Field1')(<Input placeholder="规格" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="正面宣传语">
                      {getFieldDecorator('Field1')(<Input placeholder="正面宣传语" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="反面宣传语">
                      {getFieldDecorator('Field1')(<Input placeholder="反面宣传语" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="设置时间">
                      {getFieldDecorator('Field1')(<DatePicker placeholder="设置时间" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="生产厂家">
                      {getFieldDecorator('Field1')(<Input placeholder="生产厂家" />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="管理单位">
                      {getFieldDecorator('Field1')(<Input placeholder="管理单位" />)}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={st.group}>
              <div className={st.grouptitle}>标志照片</div>
              <div className={st.groupcontent}>
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
              </div>
            </div>
          </Form>
        </div>

        <div className={st.footer}>
          <Button type="primary">保存</Button>
          &emsp;
          <Button>取消</Button>
        </div>
      </div>
    );
  }
}

GPForm = Form.create()(GPForm);
export default GPForm;
