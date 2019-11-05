import React from 'react';
import SettlementDoorplate from './SettlementDoorplate.js';
import BuildingDoorplate from './BuildingDoorplate.js';
import RoadDoorplate from './RoadDoorplate.js';
import BridgeDoorplate from './BridgeDoorplate.js';
import Authorized from '../../../utils/Authorized4';
import { NavTag, CurrentTag } from '../../../common/Navs/NavTab';
import st from './ToponymySearch.less';

const ToponymySearch = () => {
  let [currentTag, changeTag] = CurrentTag({ initTag: 'Settlement' });
  const getContent = () => {
    switch (currentTag) {
      case 'Settlement':
        return (
          <Authorized>
            <SettlementDoorplate />
          </Authorized>
        );
      case 'Building':
        return (
          <Authorized>
            <BuildingDoorplate />
          </Authorized>
        );
      case 'Road':
        return (
          <Authorized>
            <RoadDoorplate />
          </Authorized>
        );
      case 'Bridge':
        return (
          <Authorized>
            <BridgeDoorplate />
          </Authorized>
        );
      default:
        return <Authorized>{/* <HouseDoorplate /> */}</Authorized>;
    }
  };

  return (
    <div className={st.DoorplateSearch}>
      <div className={st.navs}>
        <NavTag Current={currentTag} Type="Settlement" TypeName="居民点" onClick={changeTag} />
        <NavTag Current={currentTag} Type="Building" TypeName="建筑物" onClick={changeTag} />
        <NavTag Current={currentTag} Type="Road" TypeName="道路街巷" onClick={changeTag} />
        <NavTag Current={currentTag} Type="Bridge" TypeName="桥梁" onClick={changeTag} />
      </div>
      <div className={st.content}>{getContent()}</div>
    </div>
  );
};

export default ToponymySearch;
