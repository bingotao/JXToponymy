import React, { Component } from 'react';
import { Button, Row, Col, Input, Select, Form } from 'antd';
import HDForm from '../Forms/HDFormNew.js';
import RDForm from '../Forms/RDFormNew.js';
import VGForm from '../Forms/VGFormNew.js';
import Authorized from '../../../utils/Authorized4';
import st from './DoorplateAdd.less';
const FormItem = Form.Item;

class DoorplateAdd extends Component {
  state = {
    current: 'HDForm',
    // current: this.props.history.location.state
    //   ? this.props.history.location.state.WSSQ_INFO.activeTab
    //   : 'HDForm',
    //门牌申请，默认：个人申请
    // FormType: this.props.history.location.state
    // ? (this.props.history.location.state.WSSQ_INFO.WSSQ_DATA.ApplicationWay=="个人申请"?'grsq':'dwsq')
    // :'grsq',
    FormType: 'grsq',
    //门牌个人申请分类
    MPGRSQType: null,
    reset: false,
    saveBtnClicked: false, // 点击保存后按钮置灰
  };

  //定义一个拿子组件返回值this的函数
  onRef = ref => {
    this.curFormRef = ref;
  };

  getContent() {
    let { current, FormType, MPGRSQType } = this.state;
    var WSSQ_INFO = {};
    if (this.props.history.location.state) {
      WSSQ_INFO = this.props.history.location.state;
    }

    switch (current) {
      case 'RDForm':
        return (
          <Authorized>
            <RDForm
              doorplateType={'DoorplateAdd'}
              FormType={FormType}
              MPGRSQType={MPGRSQType}
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
              doorplateType={'DoorplateAdd'}
              FormType={FormType}
              MPGRSQType={MPGRSQType}
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
              doorplateType={'DoorplateAdd'}
              FormType={FormType}
              MPGRSQType={MPGRSQType}
              onRef={this.onRef}
              clickSaveBtn={e => this.setState({ saveBtnClicked: true })}

              WSSQ_INFO={WSSQ_INFO}
            />
          </Authorized>
        );
    }
  }

  //办件事项类型，个人申请或单位申请
  changeFormType(value) {
    if (value === 'grsq') {
      this.curFormRef.setZjlxData('居民身份证');
    } else {
      this.curFormRef.setZjlxData('统一社会信用代码证');
    }
    this.setState({ FormType: value });
  }

  //办件事项类型，个人申请或单位申请
  changeMpgrsqType(value) {
    this.setState({ MPGRSQType: value });
  }

  componentDidMount() {
    let that = this;
    var MPGRSQType = null;
    if (this.props.history.location.state) {
      var WSSQ_INFO = this.props.history.location.state;
      this.setState({
        current: WSSQ_INFO.activeTab,
        FormType: WSSQ_INFO.WSSQ_DATA.ItemType == "GRSQ" ? 'grsq' : 'dwsq',
      });
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

        switch ($this.data('target')) {
          case 'HDForm':
            MPGRSQType = null;
            break;
          case 'RDForm':
            MPGRSQType = 'dpfg';
            break;
          case 'VGForm':
            MPGRSQType = 'ncfh';
            break;
          default:
            break;
        }

        that.setState({
          current: $this.data('target'),
          MPGRSQType: MPGRSQType,
          saveBtnClicked: false,
        });
      });
  }

  render() {
    let { reset, FormType, current, saveBtnClicked } = this.state;
    return (
      <div className={st.DoorplateChange}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          <div className={current == 'HDForm' ? "active" : ''} data-target="HDForm">
            住宅门牌
          </div>
          <div className={current == 'RDForm' ? "active" : ''} data-target="RDForm">道路门牌</div>
          <div className={current == 'VGForm' ? "active" : ''} data-target="VGForm">农村门牌</div>
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
                        // defaultValue={'grsq'}
                        defaultValue={FormType}
                        onChange={value => this.changeFormType(value)}
                        disabled={saveBtnClicked}
                      >
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
                        <Select defaultValue={'dpfg'} disabled={saveBtnClicked}>
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
                        <Select defaultValue={'ncfh'} disabled={saveBtnClicked}>
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
