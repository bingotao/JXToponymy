import React, { Component } from 'react';
import { Button, Row, Col, Input, Select, Form } from 'antd';
import HDForm from '../Forms/HDForm.js';
import RDForm from '../Forms/RDForm.js';
import VGFrom from '../Forms/VGForm.js';
import Authorized from '../../../utils/Authorized4';

import st from './DoorplateChange.less';
const FormItem = Form.Item;

class DoorplateChange extends Component {
  state = {
    current: 'HDForm',
    reset: false,
  };

  getContent() {
    let { current } = this.state;

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
            <HDForm doorplateChange={true} />
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

  render() {
    let { reset } = this.state;
    return (
      <div className={st.DoorplateChange}>
        <div className={st.reset}>
          <Button
            type="primary"
            icon="file-add"
            onClick={e => this.setState({ reset: true }, e => this.setState({ reset: false }))}
          >
            追加门牌
          </Button>
        </div>
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
                      <Select defaultValue={'个人申请变更门牌证'}>
                        <Select.Option value={'个人申请变更门牌证'}>
                          个人申请变更门牌证
                        </Select.Option>
                        <Select.Option value={'单位申请变更门牌证'}>
                          单位申请变更门牌证
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
          <div className={st.formcontent}>{reset ? null : this.getContent()}</div>
        </div>
      </div>
    );
  }
}

DoorplateChange = Form.create()(DoorplateChange);
export default DoorplateChange;
