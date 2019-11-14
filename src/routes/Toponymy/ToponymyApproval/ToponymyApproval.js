import React, { Component, useState } from 'react';
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

const ToponymyApproval = props => {
  let [currentTag, changeTag] = CurrentTag({
    initTag: props.history.location.state
      ? props.history.location.state.activeTab
      : 'SettlementForm',
  });
  const [saveBtnClicked, setSaveBtnClicked] = useState(false);

  const getContent = () => {
    var id = props.history.location.state ? props.history.location.state.id : null; //查询时点击一条记录跳转过来
    switch (currentTag) {
      case 'SettlementForm':
        return (
          <Authorized>
            <SettlementForm id={id} FormType={FormType} clickSaveBtn={clickSaveBtn} />
          </Authorized>
        );
      case 'BuildingForm':
        return (
          <Authorized>
            <BuildingForm id={id} FormType={FormType} clickSaveBtn={clickSaveBtn} />
          </Authorized>
        );
      case 'RoadForm':
        return (
          <Authorized>
            <RoadForm id={id} FormType={FormType} clickSaveBtn={clickSaveBtn} />
          </Authorized>
        );
      case 'BridgeForm':
        return (
          <Authorized>
            <BridgeForm id={id} FormType={FormType} clickSaveBtn={clickSaveBtn} />
          </Authorized>
        );
      default:
        return <Authorized />;
    }
  };

  // 子组件中点击保存，办件事项置灰
  const clickSaveBtn = e => {
    setSaveBtnClicked(true);
  };

  return (
    <div className={st.ToponymyApproval}>
      {props.history.location.state ? (
        <div className={st.navs}>
          {currentTag == 'SettlementForm' ? (
            <NavTag
              Current={currentTag}
              Type="SettlementForm"
              TypeName="居民点"
              onClick={changeTag}
            />
          ) : null}
          {currentTag == 'BuildingForm' ? (
            <NavTag
              Current={currentTag}
              Type="BuildingForm"
              TypeName="建筑物"
              onClick={changeTag}
            />
          ) : null}
          {currentTag == 'RoadForm' ? (
            <NavTag Current={currentTag} Type="RoadForm" TypeName="道路街巷" onClick={changeTag} />
          ) : null}
          {currentTag == 'BridgeForm' ? (
            <NavTag Current={currentTag} Type="BridgeForm" TypeName="桥梁" onClick={changeTag} />
          ) : null}
        </div>
      ) : (
        <div className={st.navs}>
          <NavTag
            Current={currentTag}
            Type="SettlementForm"
            TypeName="居民点"
            onClick={changeTag}
          />
          <NavTag Current={currentTag} Type="BuildingForm" TypeName="建筑物" onClick={changeTag} />
          <NavTag Current={currentTag} Type="RoadForm" TypeName="道路街巷" onClick={changeTag} />
          <NavTag Current={currentTag} Type="BridgeForm" TypeName="桥梁" onClick={changeTag} />
        </div>
      )}

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
                      <Select defaultValue={11} disabled={saveBtnClicked}>
                        <Select.Option value={11}>{dmsx[11]}</Select.Option>
                      </Select>
                    ) : null}
                    {currentTag == 'RoadForm' || currentTag == 'BridgeForm' ? (
                      <Select defaultValue={12} disabled={saveBtnClicked}>
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
