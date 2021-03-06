import React, { Component } from 'react';
import { Button, Row, Col, Input, Select, Form } from 'antd';
import HDForm from '../Forms/HDFormNew.js';
import RDForm from '../Forms/RDFormNew.js';
import VGForm from '../Forms/VGFormNew.js';
import Authorized from '../../../utils/Authorized4';
import st from './DoorplateDelete.less';
const FormItem = Form.Item;

class DoorplateDelete extends Component {
  state = {
    current: this.props.history.location.state
      ? this.props.history.location.state.activeTab
      : 'HDForm',
    //门牌注销，默认：个人注销
    FormType: 'grzx',
    saveBtnClicked: false, // 点击保存后按钮置灰
  };

  //定义一个拿子组件返回值this的函数
  onRef = ref => {
    this.curFormRef = ref;
  };

  getContent() {
    let { current, FormType } = this.state;
    var id = this.props.history.location.state ? this.props.history.location.state.id : null; //查询时点击一条记录跳转过来
    var WSSQ_INFO = this.props.history.location.state && this.props.history.location.state.blType ? this.props.history.location.state : null; // 来自个人中心

    switch (current) {
      case 'RDForm':
        return (
          <Authorized>
            <RDForm
              id={id}
              doorplateType={'DoorplateDelete'}
              FormType={FormType}
              onRef={this.onRef}
              clickSaveBtn={e => this.setState({ saveBtnClicked: true })}
              WSSQ_INFO={WSSQ_INFO}
            />
          </Authorized>
        );
      case 'VGForm':
        return (
          <Authorized>
            <VGForm
              id={id}
              doorplateType={'DoorplateDelete'}
              FormType={FormType}
              onRef={this.onRef}
              clickSaveBtn={e => this.setState({ saveBtnClicked: true })}
              WSSQ_INFO={WSSQ_INFO}
            />
          </Authorized>
        );
      default:
        return (
          <Authorized>
            <HDForm
              id={id}
              doorplateType={'DoorplateDelete'}
              FormType={FormType}
              onRef={this.onRef}
              clickSaveBtn={e => this.setState({ saveBtnClicked: true })}
              WSSQ_INFO={WSSQ_INFO}
            />
          </Authorized>
        );
    }
  }

  componentDidMount() {
    let that = this;
    if (this.props.history.location.state) {
      var WSSQ_INFO = this.props.history.location.state;
      if (WSSQ_INFO.activeTab && WSSQ_INFO.WSSQ_DATA) {
        this.setState({
          current: WSSQ_INFO.activeTab,
          FormType: WSSQ_INFO.WSSQ_DATA.ApplicationWay == "个人申请" ? 'grsq' : 'dwsq',
        });
      }
    }
    $(this.navs)
      .find('div')
      .on('click', function () {
        let ac = 'active';
        let $this = $(this);
        $this
          .addClass(ac)
          .siblings()
          .removeClass(ac);

        that.setState({ current: $this.data('target') });
      });
  }

  //办件事项类型
  changeFormType(value) {
    if (value === 'grzx') {
      this.curFormRef.setZjlxData('居民身份证');
    } else {
      this.curFormRef.setZjlxData('统一社会信用代码证');
    }
    this.setState({ FormType: value });
  }

  render() {
    let { reset, FormType, current, saveBtnClicked } = this.state;

    return (
      <div className={st.DoorplateDelete}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          {current == 'HDForm' ? (
            <div className="active" data-target="HDForm">
              住宅门牌
            </div>
          ) : null}
          {current == 'RDForm' ? (
            <div className="active" data-target="RDForm">
              道路门牌
            </div>
          ) : null}
          {current == 'VGForm' ? (
            <div className="active" data-target="VGForm">
              农村门牌
            </div>
          ) : null}
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
                        defaultValue={'grzx'}
                        onChange={value => this.changeFormType(value)}
                        disabled={saveBtnClicked}
                      >
                        <Select.Option value={'grzx'}>
                          个人申请注销门（楼）牌号码及门牌证
                        </Select.Option>
                        <Select.Option value={'dwzx'}>
                          单位申请注销门（楼）牌号码及门牌证
                        </Select.Option>
                      </Select>
                    </FormItem>
                  </Col>
                  {/* <Col span={16}>
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
                  </Col> */}
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

DoorplateDelete = Form.create()(DoorplateDelete);
export default DoorplateDelete;
