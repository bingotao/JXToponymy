import React, { Component } from 'react';
import { Button, Row, Col, Input, Select, Form } from 'antd';
import HDForm from '../Forms/HDFormNew.js';
import RDForm from '../Forms/RDFormNew.js';
import VGFrom from '../Forms/VGFormNew.js';
import Authorized from '../../../utils/Authorized4';
import st from './DoorplateBatchDelete.less';
const FormItem = Form.Item;

class DoorplateBatchDelete extends Component {
  state = {
    current: this.props.current ? this.props.current : 'HDForm',
    //门牌注销，默认：个人注销
    FormType: 'grzx',
  };

  getContent() {
    let { current, FormType } = this.state;
    var ids = this.props.ids ? this.props.ids : null; //查询时点击一条记录跳转过来

    switch (current) {
      case 'RDForm':
        return (
          <Authorized>
            <RDForm
              ids={ids}
              doorplateType={'DoorplateBatchDelete'}
              showAttachment={false}
              FormType={FormType}
              onCancel={this.props.onCancel}
            />
          </Authorized>
        );
      case 'VGForm':
        return (
          <Authorized>
            <VGFrom
              ids={ids}
              doorplateType={'DoorplateBatchDelete'}
              showAttachment={false}
              FormType={FormType}
              onCancel={this.props.onCancel}
            />
          </Authorized>
        );
      default:
        return (
          <Authorized>
            <HDForm
              ids={ids}
              doorplateType={'DoorplateBatchDelete'}
              showAttachment={false}
              FormType={FormType}
              onCancel={this.props.onCancel}
            />
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

  //办件事项类型
  changeFormType(value) {
    this.setState({ FormType: value });
  }

  // onCancel() {
  //   this.history.push({
  //     pathname: '/placemanage/doorplate/doorplatesearchnew',
  //   });
  // }

  render() {
    var s = this.state;
    return (
      <div className={st.DoorplateBatchDelete}>
        <div ref={e => (this.navs = e)} className={st.navs}>
          {s.current == 'HDForm' ? (
            <div className="active" data-target="HDForm">
              住宅门牌
            </div>
          ) : null}
          {s.current == 'RDForm' ? (
            <div className="active" data-target="RDForm">
              道路门牌
            </div>
          ) : null}
          {s.current == 'VGForm' ? (
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
          <div className={st.formcontent}>{this.getContent()}</div>
        </div>
      </div>
    );
  }
}

DoorplateBatchDelete = Form.create()(DoorplateBatchDelete);
export default DoorplateBatchDelete;
