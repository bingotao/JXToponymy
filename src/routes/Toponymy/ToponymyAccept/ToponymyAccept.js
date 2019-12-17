import React from 'react';
import Authorized from '../../../utils/Authorized4';
import SettlementForm from '../Forms/SettlementForm.js';
import BuildingForm from '../Forms/BuildingForm.js';
import RoadForm from '../Forms/RoadForm.js';
import BridgeForm from '../Forms/BridgeForm.js';
import st from './ToponymyAccept.less';
import { NavTag, CurrentTag } from '../../../common/Navs/NavTab';

const FormType = 'ToponymyAccept';

const ToponymyAccept = props => {
  let [currentTag, changeTag] = CurrentTag({ initTag: 'SettlementForm' });
  const getContent = () => {
    var WSSQ_INFO = props.history.location.state && props.history.location.state.blType ? props.history.location.state : null; // 来自个人中心

    switch (currentTag) {
      case 'SettlementForm':
        return (
          <Authorized>
            <SettlementForm FormType={FormType} WSSQ_INFO={WSSQ_INFO} />
          </Authorized>
        );
      case 'BuildingForm':
        return (
          <Authorized>
            <BuildingForm FormType={FormType} WSSQ_INFO={WSSQ_INFO} />
          </Authorized>
        );
      case 'RoadForm':
        return (
          <Authorized>
            <RoadForm FormType={FormType} WSSQ_INFO={WSSQ_INFO} />
          </Authorized>
        );
      case 'BridgeForm':
        return (
          <Authorized>
            <BridgeForm FormType={FormType} WSSQ_INFO={WSSQ_INFO} />
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
        <NavTag Current={currentTag} Type="RoadForm" TypeName="道路街巷" onClick={changeTag} />
        <NavTag Current={currentTag} Type="BridgeForm" TypeName="桥梁" onClick={changeTag} />
      </div>
      <div className={st.content}>{getContent()}</div>
    </div>
  );
};

export default ToponymyAccept;
