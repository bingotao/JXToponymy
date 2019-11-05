import React, { Component } from 'react';
import { Button } from 'antd';
import Authorized from '../../../utils/Authorized4';
import SettlementForm from '../Forms/SettlementForm.js';
import BuildingForm from '../Forms/BuildingForm.js';
import RoadForm from '../Forms/RoadForm.js';
import BridgeForm from '../Forms/BridgeForm.js';
import st from './ToponymyCancel.less';
import { NavTag, CurrentTag } from '../../../common/Navs/NavTab';
const FormType = 'ToponymyCancel';

const ToponymyCancel = props => {
  let [currentTag, changeTag] = CurrentTag({
    initTag: props.history.location.state
      ? props.history.location.state.activeTab
      : 'SettlementForm',
  });
  const getContent = () => {
    var id = props.history.location.state ? props.history.location.state.id : null; //查询时点击一条记录跳转过来
    switch (currentTag) {
      case 'SettlementForm':
        return (
          <Authorized>
            <SettlementForm id={id} FormType={FormType} />
          </Authorized>
        );
      case 'BuildingForm':
        return (
          <Authorized>
            <BuildingForm id={id} FormType={FormType} />
          </Authorized>
        );
      case 'RoadForm':
        return (
          <Authorized>
            <RoadForm id={id} FormType={FormType} />
          </Authorized>
        );
      case 'BridgeForm':
        return (
          <Authorized>
            <BridgeForm id={id} FormType={FormType} />
          </Authorized>
        );
      default:
        return <Authorized />;
    }
  };

  return (
    <div className={st.ToponymyCancel}>
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
          <NavTag Current={currentTag} Type="BuildingForm" TypeName="建筑物" onClick={changeTag} />
        ) : null}
        {currentTag == 'RoadForm' ? (
          <NavTag Current={currentTag} Type="RoadForm" TypeName="道路街巷" onClick={changeTag} />
        ) : null}
        {currentTag == 'BridgeForm' ? (
          <NavTag Current={currentTag} Type="BridgeForm" TypeName="桥梁" onClick={changeTag} />
        ) : null}
      </div>
      <div className={st.content}>
        <div className={st.formcontent}>{getContent()}</div>
      </div>
    </div>
  );
};

export default ToponymyCancel;
