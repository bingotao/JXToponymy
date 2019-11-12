import React, { Component } from 'react';
import { Button, Row, Col, Input, Select, Form } from 'antd';

import SettlementForm from '../Forms/SettlementForm.js';
import BuildingForm from '../Forms/BuildingForm.js';
import RoadForm from '../Forms/RoadForm.js';
import BridgeForm from '../Forms/BridgeForm.js';
import Authorized from '../../../utils/Authorized4';
import st from './ToponymyBatchDelete.less';
const FormItem = Form.Item;
const FormType = 'ToponymyBatchDelete';
class ToponymyBatchDelete extends Component {
  state = {
    current: this.props.current ? this.props.current : 'SettlementForm',
    //门牌注销，默认：个人注销
    // FormType: 'grzx',
  };

  getContent() {
    let { current } = this.state;
    var ids = this.props.ids ? this.props.ids : null; //查询时点击一条记录跳转过来

    switch (current) {
      case 'SettlementForm':
        return (
          <Authorized>
            <SettlementForm ids={ids} FormType={FormType} onCancel={this.props.onCancel} />
          </Authorized>
        );
      case 'BuildingForm':
        return (
          <Authorized>
            <BuildingForm ids={ids} FormType={FormType} onCancel={this.props.onCancel} />
          </Authorized>
        );
      case 'RoadForm':
        return (
          <Authorized>
            <RoadForm ids={ids} FormType={FormType} onCancel={this.props.onCancel} />
          </Authorized>
        );
      case 'BridgeForm':
        return (
          <Authorized>
            <BridgeForm ids={ids} FormType={FormType} onCancel={this.props.onCancel} />
          </Authorized>
        );
      default:
        return <Authorized />;
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

  //办件事项类型
  // changeFormType(value) {
    // this.setState({ FormType: value });
  // }

  // onCancel() {
  //   this.history.push({
  //     pathname: '/placemanage/doorplate/doorplatesearchnew',
  //   });
  // }

  render() {
    var s = this.state;
    return (
      <div className={st.ToponymyBatchDelete}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          {s.current == 'BridgeForm' ? (
            <div className="active" data-target="BridgeForm">
              桥梁
            </div>
          ) : null}
          {s.current == 'SettlementForm' ? (
            <div className="active" data-target="SettlementForm">
              居民点
            </div>
          ) : null}
          {s.current == 'BuildingForm' ? (
            <div className="active" data-target="BuildingForm">
              建筑物
            </div>
          ) : null}
          {s.current == 'BridgeForm' ? (
            <div className="active" data-target="BridgeForm">
              桥梁
            </div>
          ) : null}
        </div>
        <div className={st.content}>
          {/* <Form>
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
                      <Select defaultValue={'dwzx'} onChange={value => this.changeFormType(value)}>
                        <Select.Option value={'grzx'}>
                          个人申请注销门（楼）牌号码及门牌证
                        </Select.Option>
                        <Select.Option value={'dwzx'}>
                          单位申请注销门（楼）牌号码及门牌证
                        </Select.Option>
                      </Select>
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
           */}
          <div className={st.formcontent}>{this.getContent()}</div>
        </div>
      </div>
    );
  }
}

ToponymyBatchDelete = Form.create()(ToponymyBatchDelete);
export default ToponymyBatchDelete;
