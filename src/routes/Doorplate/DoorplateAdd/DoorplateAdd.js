import React, { Component } from 'react';
import { Button, Row, Col, Input, Select, Form } from 'antd';
import HDForm from '../Forms/HDFormNew.js';
import RDForm from '../Forms/RDForm.js';
import VGFrom from '../Forms/VGForm.js';
import Authorized from '../../../utils/Authorized4';
import { mpsqType, mpgrsqType } from '../../../common/enums.js';
import st from './DoorplateAdd.less';
const FormItem = Form.Item;

class DoorplateChange extends Component {
  state = {
    current: 'HDForm',
    //门牌申请，默认：个人申请
    FormType: mpsqType.grsq,
    //门牌个人申请分类，默认：农村分户
    MPGRSQType: mpgrsqType.ncfh,
    reset: false,
  };

  getContent() {
    let { current, FormType, MPGRSQType } = this.state;

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
            <HDForm doorplateChange={true} FormType={FormType} MPGRSQType={MPGRSQType} />
          </Authorized>
        );
    }
  }

  //变更事项类型，个人申请或单位申请
  changeFormType(value) {
    if (value === mpsqType.grsq) {
      this.setState({ MPGRSQType: mpgrsqType.ncfh });
    } else {
      this.setState({ MPGRSQType: null });
    }
    this.setState({ FormType: value });
  }
  
  //变更事项类型，个人申请或单位申请
  changeMpgrsqType(value) {   
    this.setState({ MPGRSQType: value });
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
                事项信息<span>说明：“ * ”号标识的为必填项</span>
              </div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>办件事项
                        </span>
                      }
                    >
                      <Select
                        defaultValue={'个人申请门（楼）牌号码及门牌证'}
                        onChange={value => this.changeFormType(value)}
                      >
                        <Select.Option value={'个人申请门（楼）牌号码及门牌证'}>
                          个人申请门（楼）牌号码及门牌证
                        </Select.Option>
                        <Select.Option value={'单位申请门（楼）牌号码及门牌证'}>
                          单位申请门（楼）牌号码及门牌证
                        </Select.Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    {/* 个人申请则显示 */}
                    {this.state.FormType === mpsqType.grsq ? (
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>事项分类
                          </span>
                        }
                      >
                        <Select
                          defaultValue={'农村分户'}
                          onChange={value => this.changeMpgrsqType(value)}
                        >
                          <Select.Option value={'农村分户'}>农村分户</Select.Option>
                          <Select.Option value={'店铺分割'}>店铺分割</Select.Option>
                        </Select>
                      </FormItem>
                    ) : null}
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
          {reset ? null : this.getContent()}
        </div>
      </div>
    );
  }
}

DoorplateChange = Form.create()(DoorplateChange);
export default DoorplateChange;
