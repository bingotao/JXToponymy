import React, { Component } from 'react';
import { Button, Row, Col, Input, Select, Form } from 'antd';
import HDForm from '../Forms/HDFormNew.js';
import RDForm from '../Forms/RDFormNew.js';
import VGFrom from '../Forms/VGFormNew.js';
import Authorized from '../../../utils/Authorized4';
import st from './DoorplateAdd.less';
const FormItem = Form.Item;

class DoorplateAdd extends Component {
  state = {
    current: 'HDForm',
    //门牌申请，默认：个人申请
    FormType: 'grsq',
    //门牌个人申请分类，默认：农村分户
    MPGRSQType: 'ncfh',
    reset: false,
  };

  getContent() {
    let { current, FormType, MPGRSQType } = this.state;

    switch (current) {
      case 'RDForm':
        return (
          <Authorized>
            <RDForm
              doorplateAdd={true}
              FormType={FormType}
              MPGRSQType={MPGRSQType}
              ref="RDForm"
            />
          </Authorized>
        );
      case 'VGForm':
        return (
          <Authorized>
            <VGFrom
              doorplateAdd={true}
              FormType={FormType}
              MPGRSQType={MPGRSQType}
              ref="VGFrom"
            />
          </Authorized>
        );
      default:
        return (
          <Authorized>
            <HDForm
              doorplateAdd={true}
              FormType={FormType}
              MPGRSQType={MPGRSQType}
              ref="HDForm"
            />
          </Authorized>
        );
    }
  }

  //变更事项类型，个人申请或单位申请
  changeFormType(value) {
    let { current } = this.state;
    if (value === 'grsq') {
      this.setState({ MPGRSQType: 'ncfh' });
      switch (current) {
        case 'RDForm':
          this.refs.RDForm.setFieldsValue({
            IDType: '居民身份证',
          });
          break;
        case 'VGFrom':
          this.refs.VGFrom.setFieldsValue({
            IDType: '居民身份证',
          });
          break;
        case 'HDForm':
          this.refs.HDForm.setFieldsValue({
            IDType: '居民身份证',
          });
          break;
        default:
          break;
      }
    } else {
      this.setState({ MPGRSQType: null });
      switch (current) {
        case 'RDForm':
          this.refs.RDForm.setFieldsValue({
            IDType: '统一社会信用代码证',
          });
          break;
        case 'VGFrom':
          this.refs.VGFrom.setFieldsValue({
            IDType: '统一社会信用代码证',
          });
          break;
        case 'HDForm':
          this.refs.HDForm.setFieldsValue({
            IDType: '统一社会信用代码证',
          });
          break;
        default:
          break;
      }
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
    let { reset, FormType, current } = this.state;
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
                      <Select defaultValue={'grsq'} onChange={value => this.changeFormType(value)}>
                        <Select.Option value={'grsq'}>个人申请门（楼）牌号码及门牌证</Select.Option>
                        <Select.Option value={'dwsq'}>单位申请门（楼）牌号码及门牌证</Select.Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    {/* 个人申请则显示 */}
                    {FormType === 'grsq' && current == 'RDForm' ? (
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>事项分类
                          </span>
                        }
                      >
                        <Select defaultValue={'dpfg'}>
                          <Select.Option value={'dpfg'}>店铺分割</Select.Option>
                        </Select>
                      </FormItem>
                    ) : null}
                    {FormType === 'grsq' && current == 'VGForm' ? (
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>事项分类
                          </span>
                        }
                        >
                        <Select defaultValue={'ncfh'}>
                          <Select.Option value={'ncfh'}>农村分户</Select.Option>
                        </Select>
                      </FormItem>
                    ) : null}
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

DoorplateAdd = Form.create()(DoorplateAdd);
export default DoorplateAdd;
