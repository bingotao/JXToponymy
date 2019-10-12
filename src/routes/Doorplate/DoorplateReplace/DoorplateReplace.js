import React, { Component } from 'react';
import { Button, Row, Col, Input, Select, Form } from 'antd';
import HDForm from '../Forms/HDFormNew.js';
import RDForm from '../Forms/RDForm.js';
import VGFrom from '../Forms/VGForm.js';
import Authorized from '../../../utils/Authorized4';
import { mpsqType } from '../../../common/enums.js';
import st from './DoorplateReplace.less';
const FormItem = Form.Item;

class DoorplateChange extends Component {
  state = {
    current: 'HDForm',
    //门牌换补，默认：个人换补
    FormType: mpsqType.grhb,
  };

  getContent() {
    let { current,FormType } = this.state;

    switch (current) {
      case 'RDForm':
        return (
          <Authorized>
            <RDForm doorplateChange={true} />
          </Authorized>
        );
      case 'VGForm':
        return (
          <Authorized>
            <VGFrom doorplateChange={true} />
          </Authorized>
        );
      default:
        return (
          <Authorized>
            <HDForm doorplateChange={true} FormType={FormType} />
          </Authorized>
        );
    }
  }

  componentDidMount() {
    let that = this;
    $(this.navs)
      .find('div')
      .on('click', function() {
        let ac = 'active';
        let $this = $(this);
        $this
          .addClass(ac)
          .siblings()
          .removeClass(ac);

        that.setState({ current: $this.data('target') });
      });
  }

  //变更事项类型
  changeFormType(value) {
    this.setState({ FormType: value });
  }

  render() {
    return (
      <div className={st.DoorplateChange}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className="active" data-target="HDForm">
            住宅门牌
          </div>
          <div data-target="RDForm">道路门牌</div>
          <div data-target="VGForm">农村门牌</div>
        </div>
        <div className={st.content}>
          <Form>
            <div className={st.group}>
              <div className={st.grouptitle}>
                查询条件<span>说明：“ * ”号标识的为必填项</span>
              </div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>变更事项
                        </span>
                      }
                    >
                      <Select
                        defaultValue={'个人申请换（补）发门牌证'}
                        onChange={value => this.changeFormType(value)}
                      >
                        <Select.Option value={'个人申请换（补）发门牌证'}>
                        个人申请换（补）发门牌证
                        </Select.Option>
                        <Select.Option value={'单位申请换（补）门牌证'}>
                        单位申请换（补）门牌证
                        </Select.Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={16}>
                    <FormItem
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 20 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>门牌证号
                        </span>
                      }
                    >
                      <div>
                        <Input placeholder="证件号码" style={{ width: '50%' }} />
                        &ensp;
                        <Button type="primary" shape="circle" icon="search" />
                      </div>
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
          <div className={st.formcontent}>{this.getContent()}</div>
        </div>
      </div>
    );
  }
}

DoorplateChange = Form.create()(DoorplateChange);
export default DoorplateChange;
