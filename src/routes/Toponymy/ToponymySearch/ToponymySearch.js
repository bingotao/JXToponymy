import React from 'react';
import SettlementDoorplate from './SettlementDoorplate.js';
import BuildingDoorplate from './BuildingDoorplate.js';
import RoadDoorplate from './RoadDoorplate.js';
import BridgeDoorplate from './BridgeDoorplate.js';
import Authorized from '../../../utils/Authorized4';
import { NavTag, CurrentTag } from '../../../common/Navs/NavTab';
import st from './ToponymySearch.less';

const ToponymySearch = props => {
  let [currentTag, changeTag] = CurrentTag({
    initTag: props.history.location.state
      ? props.history.location.state.activeTab
      : 'SettlementForm',
  });
  const getContent = () => {
    switch (currentTag) {
      case 'SettlementForm':
        return (
          <Authorized>
            <SettlementDoorplate />
          </Authorized>
        );
      case 'BuildingForm':
        return (
          <Authorized>
            <BuildingDoorplate />
          </Authorized>
        );
      case 'RoadForm':
        return (
          <Authorized>
            <RoadDoorplate />
          </Authorized>
        );
      case 'BridgeForm':
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
        <NavTag Current={currentTag} Type='SettlementForm' TypeName="居民点" onClick={changeTag} />
        <NavTag Current={currentTag} Type='BuildingForm' TypeName="建筑物" onClick={changeTag} />
        <NavTag Current={currentTag} Type='RoadForm' TypeName="道路街巷" onClick={changeTag} />
        <NavTag Current={currentTag} Type='BridgeForm' TypeName="桥梁" onClick={changeTag} />
      </div>
      <div className={st.content}>{getContent()}</div>
    </div>
  );
};

export default ToponymySearch;
