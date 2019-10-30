import React, { Component } from 'react';
import { Button } from 'antd';
import Authorized from '../../../utils/Authorized4';

import st from './ToponymyCancel.less';
import { NavTag, CurrentTag } from '../../../common/Navs/NavTab';
const FormType = 'ToponymyCancel';

const ToponymyCancel = () => {
  let [currentTag, changeTag] = CurrentTag({ initTag: 'SettlementForm' });
  const getContent = () => {
    switch (currentTag) {
      case 'SettlementForm':
        return <Authorized />;
      case 'BuildingForm':
        return <Authorized />;
      case 'RoadForm':
        return <Authorized />;
      default:
        return <Authorized />;
    }
  };

  return (
    <div className={st.ToponymyCancel}>
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

export default ToponymyCancel;
