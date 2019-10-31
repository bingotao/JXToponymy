import React from 'react';
import { Row, Col, Select, Form } from 'antd';
const FormItem = Form.Item;
import Authorized from '../../../utils/Authorized4';
import SettlementForm from '../Forms/SettlementForm.js';
import BuildingForm from '../Forms/BuildingForm.js';
import st from './ToponymyPreApproval.less';
import { NavTag, CurrentTag } from '../../../common/Navs/NavTab';
import { dmsx } from '../../../common/enums.js';

const FormType = 'ToponymyPreApproval';

const ToponymyPreApproval = () => {
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
      default:
        return <Authorized />;
    }
  };

  return (
    <div className={st.ToponymyPreApproval}>
      <div className={st.navs}>
        <NavTag Current={currentTag} Type="SettlementForm" TypeName="居民点" onClick={changeTag} />
        <NavTag Current={currentTag} Type="BuildingForm" TypeName="建筑物" onClick={changeTag} />
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
                    <Select defaultValue={10}>
                      <Select.Option value={10}>{dmsx[10]}</Select.Option>
                    </Select>
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

export default ToponymyPreApproval;
