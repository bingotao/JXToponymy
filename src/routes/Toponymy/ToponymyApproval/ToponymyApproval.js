import React, { Component } from 'react';
import { Row, Col, Select, Form } from 'antd';
const FormItem = Form.Item;
import SettlementForm from '../Forms/SettlementForm.js';
import BuildingForm from '../Forms/BuildingForm.js';
import RoadForm from '../Forms/RoadForm.js';
import BridgeForm from '../Forms/BridgeForm.js';
import Authorized from '../../../utils/Authorized4';
import { NavTag, CurrentTag } from '../../../common/Navs/NavTab';
import st from './ToponymyApproval.less';
import { dmsx } from '../../../common/enums.js';

const FormType = 'ToponymyApproval';

const ToponymyApproval = () => {
  let [currentTag, changeTag] = CurrentTag({ initTag: 'SettlementForm' });

  const getContent = () => {
    switch (currentTag) {
      case 'SettlementForm':
        return (
          <Authorized>
            <SettlementForm FormType={FormType} />
          </Authorized>
        );
      case 'BuildingForm':
        return (
          <Authorized>
            <BuildingForm FormType={FormType} />
          </Authorized>
        );
      case 'RoadForm':
        return (
          <Authorized>
            <RoadForm FormType={FormType} />
          </Authorized>
        );
      case 'BridgeForm':
        return (
          <Authorized>
            <BridgeForm FormType={FormType} />
          </Authorized>
        );
      default:
        return <Authorized />;
    }
  };

  return (
    <div className={st.ToponymyApproval}>
      <div className={st.navs}>
        <NavTag Current={currentTag} Type="SettlementForm" TypeName="居民点" onClick={changeTag} />
        <NavTag Current={currentTag} Type="BuildingForm" TypeName="建筑物" onClick={changeTag} />
        <NavTag Current={currentTag} Type="RoadForm" TypeName="道路街巷" onClick={changeTag} />
        <NavTag Current={currentTag} Type="BridgeForm" TypeName="桥梁" onClick={changeTag} />
      </div>
      <div className={st.content}>
        <Form>
          <div className={st.group}>
            <div className={st.grouptitle}>
              事项信息<span>说明：“ * ”号标识的为必填项</span>
            </div>
            <div className={st.groupcontent}>
              <Row>
                <Col span={10}>
                  <FormItem
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label={
                      <span>
                        <span className={st.ired}>*</span>办件事项
                      </span>
                    }
                  >
                    {currentTag == 'SettlementForm' || currentTag == 'BuildingForm' ? (
                      <Select defaultValue={11}>
                        <Select.Option value={11}>{dmsx[11]}</Select.Option>
                      </Select>
                    ) : null}
                    {currentTag == 'RoadForm' || currentTag == 'BridgeForm' ? (
                      <Select defaultValue={12}>
                        <Select.Option value={12}>{dmsx[12]}</Select.Option>
                      </Select>
                    ) : null}
                  </FormItem>
                </Col>
              </Row>
            </div>
          </div>
        </Form>
        <div className={st.formcontent}>{getContent()}</div>
      </div>
    </div>
  );
};

export default ToponymyApproval;
