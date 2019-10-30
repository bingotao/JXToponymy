import React from 'react';
import Authorized from '../../../utils/Authorized4';
import SettlementForm from '../Forms/SettlementForm.js';
import BuildingForm from '../Forms/BuildingForm.js';
import st from './ToponymyPreApproval.less';
import { NavTag, CurrentTag } from '../../../common/Navs/NavTab';

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
      <div className={st.content}>{getContent()}</div>
    </div>
  );
};

export default ToponymyPreApproval;
